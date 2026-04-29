import uuid
import json
import logging
import base64
from datetime import datetime, timezone
import httpx
from sqlalchemy import select
from app.worker.celery_app import celery_app
from app.database import SyncSessionLocal
from app.models import Indicator, EnrichmentResult
from app.config import settings
from app.worker.notifications import process_instant_notifications, process_summary_notifications
from app.worker.reputation import update_user_reputation

logger = logging.getLogger(__name__)

PRIVATE_RANGES = [
    (167772160, 184549375),   # 10.0.0.0/8
    (2886729728, 2887778303), # 172.16.0.0/12
    (3232235520, 3232301055), # 192.168.0.0/16
    (2130706432, 2147483647), # 127.0.0.0/8
]


def ip_to_int(ip: str) -> int:
    parts = ip.split(".")
    n = 0
    for p in parts:
        n = n * 256 + int(p)
    return n


def is_private(ip: str) -> bool:
    try:
        n = ip_to_int(ip)
        return any(start <= n <= end for start, end in PRIVATE_RANGES)
    except Exception:
        return True


def enrich_ip_api(ip: str) -> dict:
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(f"http://ip-api.com/json/{ip}?fields=status,country,countryCode,regionName,city,org,as,isp,query")
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"ip-api.com error for {ip}: {e}")
    return {}


def enrich_shodan(ip: str) -> dict:
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(f"https://internetdb.shodan.io/{ip}")
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"Shodan InternetDB error for {ip}: {e}")
    return {}


def enrich_abuseipdb(ip: str) -> dict:
    if not settings.ABUSEIPDB_API_KEY:
        return {}
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": ip, "maxAgeInDays": 90},
                headers={"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"},
            )
            if resp.status_code == 200:
                return resp.json().get("data", {})
    except Exception as e:
        logger.warning(f"AbuseIPDB error for {ip}: {e}")
    return {}


def enrich_virustotal(ioc: str, itype: str) -> dict:
    if not settings.VIRUSTOTAL_API_KEY:
        return {}
    try:
        with httpx.Client(timeout=15) as client:
            headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
            if itype == "ip":
                url = f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}"
            elif itype == "domain":
                url = f"https://www.virustotal.com/api/v3/domains/{ioc}"
            elif itype == "url":
                encoded = base64.urlsafe_b64encode(ioc.encode()).decode().rstrip("=")
                url = f"https://www.virustotal.com/api/v3/urls/{encoded}"
            elif itype in ("hash_md5", "hash_sha256"):
                url = f"https://www.virustotal.com/api/v3/files/{ioc}"
            else:
                return {}
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json().get("data", {}).get("attributes", {})
    except Exception as e:
        logger.warning(f"VirusTotal error for {ioc}: {e}")
    return {}


def enrich_greynoise(ip: str) -> dict:
    if not settings.GREYNOISE_API_KEY:
        return {}
    try:
        with httpx.Client(timeout=10) as client:
            headers = {"key": settings.GREYNOISE_API_KEY, "Accept": "application/json"}
            resp = client.get(f"https://api.greynoise.io/v3/community/{ip}", headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"GreyNoise error for {ip}: {e}")
    return {}


def enrich_urlscan(url: str) -> dict:
    if not settings.URLSCAN_API_KEY:
        return {}
    try:
        with httpx.Client(timeout=15) as client:
            headers = {"API-Key": settings.URLSCAN_API_KEY, "Content-Type": "application/json"}
            data = {"url": url, "visibility": "public"}
            resp = client.post("https://urlscan.io/api/v1/scan/", headers=headers, json=data)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"urlscan.io error for {url}: {e}")
    return {}


def enrich_otx(ioc: str, itype: str) -> dict:
    if not settings.OTX_API_KEY:
        return {}
    try:
        otx_type = "IPv4" if itype == "ip" else "domain" if itype == "domain" else "hostname"
        if itype == "hash_md5" or itype == "hash_sha256": otx_type = "file"
        
        url = f"https://otx.alienvault.com/api/v1/indicators/{otx_type}/{ioc}/general"
        with httpx.Client(timeout=15) as client:
            headers = {"X-OTX-API-KEY": settings.OTX_API_KEY}
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"AlienVault OTX error for {ioc}: {e}")
    return {}


def enrich_securitytrails(ioc: str, itype: str) -> dict:
    if not settings.SECURITYTRAILS_API_KEY or itype not in ("ip", "domain"):
        return {}
    try:
        endpoint = f"history/{ioc}/dns/a" if itype == "domain" else f"ip/{ioc}"
        url = f"https://api.securitytrails.com/v1/{endpoint}"
        with httpx.Client(timeout=10) as client:
            headers = {"apikey": settings.SECURITYTRAILS_API_KEY}
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"SecurityTrails error for {ioc}: {e}")
    return {}


def enrich_emailrep(email: str) -> dict:
    if not settings.EMAILREP_API_KEY:
        return {}
    try:
        with httpx.Client(timeout=10) as client:
            headers = {"Key": settings.EMAILREP_API_KEY, "User-Agent": "threatmap-africa"}
            resp = client.get(f"https://emailrep.io/{email}", headers=headers)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"EmailRep error for {email}: {e}")
    return {}


def enrich_malwarebazaar(ioc: str, itype: str) -> dict:
    if itype not in ("hash_md5", "hash_sha256"):
        return {}
    try:
        with httpx.Client(timeout=10) as client:
            data = {"query": "get_info", "hash": ioc}
            resp = client.post("https://mb-api.abuse.ch/api/v1/", data=data)
            if resp.status_code == 200:
                return resp.json()
    except Exception as e:
        logger.warning(f"MalwareBazaar error for {ioc}: {e}")
    return {}


def broadcast_ws_event(indicator_id: str, status: str, enrichment_data: dict):
    try:
        import redis as redis_lib
        r = redis_lib.from_url(settings.REDIS_URL)
        message = json.dumps({
            "event": "enrichment_complete",
            "indicator_id": indicator_id,
            "status": status,
            "enrichment_data": enrichment_data,
        })
        r.publish("enrichment_events", message)
    except Exception as e:
        logger.warning(f"WebSocket broadcast error: {e}")


@celery_app.task(name="send_instant_notifications")
def send_instant_notifications(indicator_id: str):
    process_instant_notifications(indicator_id)


@celery_app.task(name="send_daily_summary")
def send_daily_summary():
    process_summary_notifications("daily")


@celery_app.task(name="send_weekly_summary")
def send_weekly_summary():
    process_summary_notifications("weekly")


@celery_app.task(name="calculate_user_reputation")
def calculate_user_reputation(user_id: str):
    update_user_reputation(user_id)


@celery_app.task(name="enrich_indicator", bind=True, max_retries=2)
def enrich_indicator(self, indicator_id: str):
    with SyncSessionLocal() as db:
        result = db.execute(select(Indicator).where(Indicator.id == indicator_id))
        indicator = result.scalar_one_or_none()
        if not indicator:
            logger.error(f"Indicator {indicator_id} not found")
            return

        itype = indicator.indicator_type
        value = indicator.value
        enrichment_data = {}
        country = ""
        asn = ""

        # Base IP enrichment
        if itype == "ip" and not is_private(value):
            ip_data = enrich_ip_api(value)
            if ip_data:
                country = ip_data.get("country", "")
                asn = ip_data.get("as", "")
                enrichment_data["ip_api"] = ip_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "ip-api.com"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="ip-api.com",
                        raw_response=ip_data,
                        malicious_votes=0,
                        country=country,
                        asn=asn,
                    ))

            shodan_data = enrich_shodan(value)
            if shodan_data:
                enrichment_data["shodan"] = shodan_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "shodan_internetdb"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="shodan_internetdb",
                        raw_response=shodan_data,
                        malicious_votes=len(shodan_data.get("vulns", [])),
                        country=country,
                        asn=asn,
                    ))

            abuse_data = enrich_abuseipdb(value)
            if abuse_data:
                votes = abuse_data.get("abuseConfidenceScore", 0)
                enrichment_data["abuseipdb"] = abuse_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "abuseipdb"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="abuseipdb",
                        raw_response=abuse_data,
                        malicious_votes=votes,
                        country=abuse_data.get("countryCode", country),
                        asn=asn,
                    ))

        # VirusTotal
        vt_data = enrich_virustotal(value, itype)
        if vt_data:
            stats = vt_data.get("last_analysis_stats", {})
            mal = stats.get("malicious", 0)
            enrichment_data["virustotal"] = vt_data
            vt_country = vt_data.get("country", country)
            vt_asn = vt_data.get("as_owner", asn)
            existing = db.execute(select(EnrichmentResult).where(
                EnrichmentResult.indicator_id == indicator.id,
                EnrichmentResult.source == "virustotal"
            )).scalar_one_or_none()
            if not existing:
                db.add(EnrichmentResult(
                    indicator_id=indicator.id,
                    source="virustotal",
                    raw_response=vt_data,
                    malicious_votes=mal,
                    country=vt_country,
                    asn=vt_asn,
                ))

        # GreyNoise
        if itype == "ip" and not is_private(value):
            gn_data = enrich_greynoise(value)
            if gn_data:
                enrichment_data["greynoise"] = gn_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "greynoise"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="greynoise",
                        raw_response=gn_data,
                        malicious_votes=1 if gn_data.get("classification") == "malicious" else 0,
                        country=gn_data.get("country", country),
                        asn=gn_data.get("metadata", {}).get("asn", asn),
                    ))

        # AlienVault OTX
        otx_data = enrich_otx(value, itype)
        if otx_data:
            enrichment_data["otx"] = otx_data
            existing = db.execute(select(EnrichmentResult).where(
                EnrichmentResult.indicator_id == indicator.id,
                EnrichmentResult.source == "otx"
            )).scalar_one_or_none()
            if not existing:
                db.add(EnrichmentResult(
                    indicator_id=indicator.id,
                    source="otx",
                    raw_response=otx_data,
                    malicious_votes=len(otx_data.get("pulse_info", {}).get("pulses", [])),
                    country=country,
                    asn=asn,
                ))

        # SecurityTrails
        if itype in ("ip", "domain"):
            st_data = enrich_securitytrails(value, itype)
            if st_data:
                enrichment_data["securitytrails"] = st_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "securitytrails"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="securitytrails",
                        raw_response=st_data,
                        malicious_votes=0,
                        country=country,
                        asn=asn,
                    ))

        # urlscan.io
        if itype == "url":
            us_data = enrich_urlscan(value)
            if us_data:
                enrichment_data["urlscan"] = us_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "urlscan.io"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="urlscan.io",
                        raw_response=us_data,
                        malicious_votes=0,
                        country=country,
                        asn=asn,
                    ))

        # EmailRep
        if itype == "email":
            er_data = enrich_emailrep(value)
            if er_data:
                enrichment_data["emailrep"] = er_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "emailrep.io"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="emailrep.io",
                        raw_response=er_data,
                        malicious_votes=1 if er_data.get("reputation") == "poor" else 0,
                        country=country,
                        asn=asn,
                    ))

        # MalwareBazaar
        if itype in ("hash_md5", "hash_sha256"):
            mb_data = enrich_malwarebazaar(value, itype)
            if mb_data and mb_data.get("query_status") == "ok":
                enrichment_data["malwarebazaar"] = mb_data
                existing = db.execute(select(EnrichmentResult).where(
                    EnrichmentResult.indicator_id == indicator.id,
                    EnrichmentResult.source == "malwarebazaar"
                )).scalar_one_or_none()
                if not existing:
                    db.add(EnrichmentResult(
                        indicator_id=indicator.id,
                        source="malwarebazaar",
                        raw_response=mb_data,
                        malicious_votes=1,
                        country=country,
                        asn=asn,
                    ))

        indicator.enrichment_data = enrichment_data
        indicator.status = "enriched"
        db.commit()

    broadcast_ws_event(indicator_id, "enriched", enrichment_data)
    send_instant_notifications.delay(indicator_id)
    logger.info(f"Enrichment complete for indicator {indicator_id}")
