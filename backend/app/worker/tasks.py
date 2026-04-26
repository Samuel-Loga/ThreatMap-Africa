import uuid
import json
import logging
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
        logger.debug("Skipping AbuseIPDB enrichment: ABUSEIPDB_API_KEY not configured")
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
        logger.debug("Skipping VirusTotal enrichment: VIRUSTOTAL_API_KEY not configured")
        return {}
    try:
        with httpx.Client(timeout=15) as client:
            headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
            if itype == "ip":
                url = f"https://www.virustotal.com/api/v3/ip_addresses/{ioc}"
            elif itype == "domain":
                url = f"https://www.virustotal.com/api/v3/domains/{ioc}"
            elif itype == "url":
                import base64
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

        indicator.enrichment_data = enrichment_data
        indicator.status = "enriched"
        db.commit()

    broadcast_ws_event(indicator_id, "enriched", enrichment_data)
    send_instant_notifications.delay(indicator_id)
    logger.info(f"Enrichment complete for indicator {indicator_id}")
