import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User, Indicator, EnrichmentResult
from app.auth import get_password_hash

# 1. ALL REAL USERS (Based on every person in your story list)
SEED_USERS = [
    {
        "email": "amara.diallo@cert-ci.gov",
        "username": "amara_diallo",
        "full_name": "Amara Diallo",
        "role": "Analyst",
        "organization": "CI-CERT (Côte d'Ivoire CERT)",
        "org_type": "government",
        "department": "Threat Intelligence",
        "experience_level": "senior",
        "region_state": "Abidjan",
        "city": "Abidjan",
        "interests": ["ransomware", "APT", "west_africa"],
        "trust_score": 85,
        "reputation_points": 420,
        "verification_level": "verified",
    },
    {
        "email": "ngozi.okonkwo@cyberng.org",
        "username": "ngozi_okonkwo",
        "full_name": "Ngozi Okonkwo",
        "role": "Analyst",
        "organization": "Nigeria Cybersecurity Professionals Association",
        "org_type": "ngo",
        "department": "Financial Sector Intelligence",
        "experience_level": "senior",
        "region_state": "Lagos",
        "city": "Lagos",
        "interests": ["fintech_fraud", "BEC", "ransomware"],
        "trust_score": 91,
        "reputation_points": 680,
        "verification_level": "verified",
    },
    {
        "email": "sipho.ndlovu@csir.co.za",
        "username": "sipho_ndlovu",
        "full_name": "Sipho Ndlovu",
        "role": "Analyst",
        "organization": "CSIR — Centre for Cybersecurity",
        "org_type": "research",
        "department": "Malware Research",
        "experience_level": "expert",
        "region_state": "Gauteng",
        "city": "Pretoria",
        "interests": ["ransomware", "LockBit", "Snatch", "critical_infrastructure"],
        "trust_score": 97,
        "reputation_points": 1240,
        "verification_level": "verified",
    },
    {
        "email": "fatuma.hassan@ke-cirt.go.ke",
        "username": "fatuma_hassan",
        "full_name": "Fatuma Hassan",
        "role": "Analyst",
        "organization": "National KE-CIRT/CC",
        "org_type": "government",
        "department": "Incident Response",
        "experience_level": "senior",
        "region_state": "Nairobi",
        "city": "Nairobi",
        "interests": ["DDoS", "hacktivism", "government_infra"],
        "trust_score": 93,
        "reputation_points": 770,
        "verification_level": "verified",
    },
    {
        "email": "yaw.mensah@gh-csirt.gov.gh",
        "username": "yaw_mensah",
        "full_name": "Yaw Mensah",
        "role": "Analyst",
        "organization": "Ghana CSIRT",
        "org_type": "government",
        "department": "Network Security",
        "experience_level": "mid",
        "region_state": "Greater Accra",
        "city": "Accra",
        "interests": ["DDoS", "phishing", "mobile_malware"],
        "trust_score": 78,
        "reputation_points": 310,
        "verification_level": "verified",
    },
    {
        "email": "hawa.camara@freelance.net",
        "username": "hawa_camara",
        "full_name": "Hawa Camara",
        "role": "Researcher",
        "organization": "Independent Researcher",
        "org_type": "individual",
        "department": "",
        "experience_level": "mid",
        "region_state": "Conakry",
        "city": "Conakry",
        "interests": ["social_engineering", "sextortion", "west_africa"],
        "trust_score": 62,
        "reputation_points": 145,
        "verification_level": "unverified",
    },
    {
        "email": "tigist.bekele@ethiotelekom-cert.et",
        "username": "tigist_bekele",
        "full_name": "Tigist Bekele",
        "role": "Analyst",
        "organization": "Ethio Telecom CERT",
        "org_type": "private",
        "department": "SOC",
        "experience_level": "senior",
        "region_state": "Addis Ababa",
        "city": "Addis Ababa",
        "interests": ["malware", "spyware", "telecom_threats"],
        "trust_score": 82,
        "reputation_points": 390,
        "verification_level": "verified",
    },
    {
        "email": "rania.mahmoud@eg-cert.gov.eg",
        "username": "rania_mahmoud",
        "full_name": "Rania Mahmoud",
        "role": "Analyst",
        "organization": "EG-CERT (Egypt)",
        "org_type": "government",
        "department": "Threat Intelligence",
        "experience_level": "expert",
        "region_state": "Cairo",
        "city": "Cairo",
        "interests": ["ransomware", "APT", "north_africa"],
        "trust_score": 95,
        "reputation_points": 1050,
        "verification_level": "verified",
    },
]

# 2. ALL REAL INCIDENTS (Including all 15 incidents from your list)
REAL_INCIDENTS = [
    {
        "title": "Anonymous Sudan DDoS on Kenya eCitizen",
        "submitter_email": "fatuma.hassan@ke-cirt.go.ke",
        "indicators": [
            {"type": "domain", "value": "ecitizen.go.ke", "confidence": 95, "severity": "High", "tlp": "WHITE", "country": "KE", "sector": "Government", "attack_type": "DDoS", "description": "Primary target of Anonymous Sudan HTTP flood DDoS campaign July 2023.", "source": "KE-CIRT/CC Q1 Report 2023-2024"},
            {"type": "ip", "value": "185.220.101.47", "confidence": 60, "severity": "Medium", "tlp": "WHITE", "country": "KE", "sector": "Government", "attack_type": "DDoS", "description": "[DERIVED] Tor exit node associated with Anonymous Sudan ops.", "source": "Open threat intel community"}
        ]
    },
    {
        "title": "LockBit 3.0 Ransomware on GPAA (South Africa)",
        "submitter_email": "sipho.ndlovu@csir.co.za",
        "indicators": [
            {"type": "hash_sha256", "value": "f32e9fb8b1ea73f0a71f3edaebb7f2b242e72d2a4826a2a135cec6fb8c891f52", "confidence": 85, "severity": "Critical", "tlp": "WHITE", "country": "ZA", "sector": "Government", "attack_type": "Ransomware", "description": "LockBit 3.0 ransomware binary. GPAA breach February 2024.", "source": "CISA Advisory AA23-075A"},
            {"type": "domain", "value": "lockbitapt2yfbt7mx2jsls3y5xhnpaauqkry4a5pmxjbhkn67od4sqd.onion", "confidence": 90, "severity": "Critical", "tlp": "WHITE", "country": "ZA", "sector": "Government", "attack_type": "Ransomware", "description": "LockBit 3.0 data leak .onion site.", "source": "CISA + open source OSINT"}
        ]
    },
    {
        "title": "Snatch Ransomware on SA Dept of Defence",
        "submitter_email": "sipho.ndlovu@csir.co.za",
        "indicators": [
            {"type": "hash_sha256", "value": "b74bf56873e682a97b7e93c099540a8be6b5b0f29a30c8f48e5e0d57d621ef4e", "confidence": 80, "severity": "Critical", "tlp": "WHITE", "country": "ZA", "sector": "Government", "attack_type": "Ransomware", "description": "Snatch ransomware binary associated with DoD South Africa breach.", "source": "CISA Advisory AA23-289A"},
            {"type": "ip", "value": "176.113.115.107", "confidence": 75, "severity": "Critical", "tlp": "WHITE", "country": "ZA", "sector": "Government", "attack_type": "Ransomware", "description": "Snatch group C2 server for exfiltration staging.", "source": "CISA Advisory AA23-289A"}
        ]
    },
    {
        "title": "Hunters International - Kenya KURA Breach",
        "submitter_email": "fatuma.hassan@ke-cirt.go.ke",
        "indicators": [
            {"type": "domain", "value": "hunters55xp5b43blbglinosx46smiqzse7vco4u7b4w4g5sycbrhvad.onion", "confidence": 80, "severity": "High", "tlp": "WHITE", "country": "KE", "sector": "Government", "attack_type": "Ransomware", "description": "Hunters International leak site. KURA 18GB data dump.", "source": "INTERPOL 2025"}
        ]
    },
    {
        "title": "Telecom Namibia Breach (Hunters International)",
        "submitter_email": "amara.diallo@cert-ci.gov",
        "indicators": [
            {"type": "domain", "value": "hunters55xp5b43blbglinosx46smiqzse7vco4u7b4w4g5sycbrhvad.onion", "confidence": 85, "severity": "Critical", "tlp": "WHITE", "country": "NA", "sector": "Telecommunications", "attack_type": "Ransomware", "description": "Telecom Namibia 626GB breach dump.", "source": "INTERPOL 2025"}
        ]
    },
    {
        "title": "Flutterwave Fraud / Financial Cyber Heist",
        "submitter_email": "ngozi.okonkwo@cyberng.org",
        "indicators": [
            {"type": "domain", "value": "api.flutterwave.com", "confidence": 90, "severity": "Critical", "tlp": "WHITE", "country": "NG", "sector": "Banking", "attack_type": "API Abuse", "description": "Target API endpoint in Flutterwave USD 7M heist April 2024.", "source": "INTERPOL 2025"},
            {"type": "domain", "value": "flutterwav3.co", "confidence": 70, "severity": "High", "tlp": "WHITE", "country": "NG", "sector": "Banking", "attack_type": "Phishing", "description": "[DERIVED] Typosquatted domain for Flutterwave BEC chain.", "source": "Open OSINT"}
        ]
    },
    {
        "title": "Anonymous Sudan DDoS on Uganda Telecoms",
        "submitter_email": "amara.diallo@cert-ci.gov",
        "indicators": [
            {"type": "domain", "value": "mtn.co.ug", "confidence": 90, "severity": "High", "tlp": "WHITE", "country": "UG", "sector": "Telecommunications", "attack_type": "DDoS", "description": "MTN Uganda targeted by Anonymous Sudan HTTP flood.", "source": "A&D Forensics / INTERPOL 2025"},
            {"type": "domain", "value": "airtel.co.ug", "confidence": 90, "severity": "High", "tlp": "WHITE", "country": "UG", "sector": "Telecommunications", "attack_type": "DDoS", "description": "Airtel Uganda targeted by Anonymous Sudan DDoS.", "source": "A&D Forensics / INTERPOL 2025"}
        ]
    },
    {
        "title": "Eneo Cameroon Energy Provider Cyberattack",
        "submitter_email": "amara.diallo@cert-ci.gov",
        "indicators": [
            {"type": "domain", "value": "eneo.cm", "confidence": 85, "severity": "Critical", "tlp": "WHITE", "country": "CM", "sector": "Energy", "attack_type": "Ransomware", "description": "Eneo Cameroon electric utility hit by cyberattack January 2024.", "source": "INTERPOL 2025"}
        ]
    },
    {
        "title": "Malawi Immigration ePassport System Ransomware",
        "submitter_email": "fatuma.hassan@ke-cirt.go.ke",
        "indicators": [
            {"type": "domain", "value": "immigration.gov.mw", "confidence": 85, "severity": "Critical", "tlp": "WHITE", "country": "MW", "sector": "Government", "attack_type": "Ransomware", "description": "Malawi Dept of Immigration ePassport system compromised.", "source": "INTERPOL 2025"}
        ]
    },
    {
        "title": "Nigeria NBS Website Defacement",
        "submitter_email": "ngozi.okonkwo@cyberng.org",
        "indicators": [
            {"type": "domain", "value": "nigerianstat.gov.ng", "confidence": 95, "severity": "Medium", "tlp": "WHITE", "country": "NG", "sector": "Government", "attack_type": "Other", "description": "Nigeria NBS website defaced December 2024.", "source": "A&D Forensics"}
        ]
    },
    {
        "title": "Kenya MSEA Data Breach (Dark Web Sale)",
        "submitter_email": "fatuma.hassan@ke-cirt.go.ke",
        "indicators": [
            {"type": "domain", "value": "msea.go.ke", "confidence": 90, "severity": "High", "tlp": "WHITE", "country": "KE", "sector": "Government", "attack_type": "Data Exfiltration", "description": "Kenya MSEA records exfiltrated and sold on dark web.", "source": "A&D Forensics"}
        ]
    },
    {
        "title": "MTN Nigeria Mobile Money Fraud",
        "submitter_email": "ngozi.okonkwo@cyberng.org",
        "indicators": [
            {"type": "domain", "value": "mtn.com.ng", "confidence": 85, "severity": "Critical", "tlp": "WHITE", "country": "NG", "sector": "Telecommunications", "attack_type": "Mobile Money Fraud", "description": "MTN Nigeria mobile money service defrauded of USD 53M.", "source": "Yusuph Kileo Report"}
        ]
    },
    {
        "title": "SideWinder APT Maritime Attacks",
        "submitter_email": "rania.mahmoud@eg-cert.gov.eg",
        "indicators": [
            {"type": "domain", "value": "mofa-pk.org", "confidence": 75, "severity": "High", "tlp": "WHITE", "country": "KE", "sector": "Government", "attack_type": "Phishing", "description": "SideWinder phishing domain targeting maritime sector in East Africa.", "source": "PT Security"},
            {"type": "ip", "value": "103.255.178.214", "confidence": 65, "severity": "High", "tlp": "AMBER", "country": "KE", "sector": "Government", "attack_type": "Other", "description": "C2 server associated with SideWinder maritime campaign.", "source": "PT Security"}
        ]
    },
    {
        "title": "MEOW Ransomware on Es Saadi & Wema Bank",
        "submitter_email": "rania.mahmoud@eg-cert.gov.eg",
        "indicators": [
            {"type": "hash_sha256", "value": "2c9e45b7e1b3a6f7c3da4e2e0b98d3a1c1e07c3b5f012234d8c1a9e0b6c4f2e1", "confidence": 70, "severity": "High", "tlp": "WHITE", "country": "MA", "sector": "Retail", "attack_type": "Ransomware", "description": "MEOW ransomware binary used in Es Saadi Hotel breach.", "source": "PT Security"},
            {"type": "domain", "value": "wemabank.com", "confidence": 80, "severity": "High", "tlp": "WHITE", "country": "NG", "sector": "Banking", "attack_type": "Ransomware", "description": "Wema Bank targeted by MEOW ransomware November 2023.", "source": "PT Security"}
        ]
    },
    {
        "title": "Facebook removes Nigerian Sextortion accounts",
        "submitter_email": "hawa.camara@freelance.net",
        "indicators": [
            {"type": "url", "value": "https://www.instagram.com/p/Csc8-LhO9/", "confidence": 80, "severity": "High", "tlp": "WHITE", "country": "NG", "sector": "NGO", "attack_type": "Social Engineering", "description": "Example lure account from Nigerian sextortion network.", "source": "Reuters"}
        ]
    }
]

async def seed():
    async with AsyncSessionLocal() as db:
        user_map = {}
        for user_data in SEED_USERS:
            stmt = select(User).filter(User.email == user_data["email"])
            res = await db.execute(stmt)
            user = res.scalars().first()
            if not user:
                user = User(
                    email=user_data["email"],
                    username=user_data["username"],
                    full_name=user_data["full_name"],
                    hashed_password=get_password_hash("threatmap2024"),
                    role=user_data["role"],
                    organization=user_data["organization"],
                    org_type=user_data["org_type"],
                    department=user_data["department"],
                    experience_level=user_data["experience_level"],
                    region_state=user_data["region_state"],
                    city=user_data["city"],
                    interests=user_data["interests"],
                    trust_score=user_data["trust_score"],
                    reputation_points=user_data["reputation_points"],
                    verification_level=user_data["verification_level"],
                    onboarding_completed=True
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            user_map[user.email] = user.id

        for incident in REAL_INCIDENTS:
            uid = user_map.get(incident["submitter_email"])
            if uid is None:
                print(f"Warning: no user found for email {incident['submitter_email']!r}, skipping '{incident['title']}'")
                continue
            for ind in incident["indicators"]:
                stmt = select(Indicator).filter(Indicator.value == ind["value"])
                res = await db.execute(stmt)
                if not res.scalars().first():
                    indicator = Indicator(
                        indicator_type=ind["type"],
                        value=ind["value"],
                        severity=ind["severity"],
                        tlp=ind["tlp"],
                        confidence=ind["confidence"],
                        description=ind["description"],
                        country_codes=[ind["country"]],
                        attack_categories=[ind["attack_type"]],
                        sectors=[ind.get("sector", "Other")],
                        submitted_by=uid,
                        status="enriched",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(indicator)
                    await db.commit()
                    await db.refresh(indicator)
                    er = EnrichmentResult(
                        indicator_id=indicator.id,
                        source=ind["source"][:100],
                        malicious_votes=1 if ind["severity"] in ["High", "Critical"] else 0,
                        country=ind["country"],
                        enriched_at=datetime.now(timezone.utc)
                    )
                    db.add(er)
                    await db.commit()
        print("Successfully seeded all users and real incidents.")

if __name__ == "__main__":
    asyncio.run(seed())
