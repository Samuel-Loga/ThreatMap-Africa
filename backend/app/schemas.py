import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


INDICATOR_TYPES = ["ip", "domain", "url", "hash_md5", "hash_sha256", "email"]
TLP_VALUES = ["WHITE", "GREEN", "AMBER", "RED"]
ROLES = ["Viewer", "Contributor", "Analyst", "OrgAdmin", "SuperAdmin"]
AFRICAN_COUNTRY_CODES = [
    "NG", "KE", "ZA", "GH", "ET", "TZ", "EG", "MA", "SN", "RW",
    "CM", "UG", "ZM", "CI", "DZ", "AO", "BF", "BI", "BJ", "BW",
    "CD", "CF", "CG", "CV", "DJ", "ER", "GA", "GM", "GN", "GQ",
    "GW", "KM", "LR", "LS", "LY", "MG", "ML", "MR", "MU", "MW",
    "MZ", "NA", "NE", "SC", "SD", "SL", "SO", "SS", "ST", "SZ",
    "TD", "TG", "TN", "ZW",
]
SECTORS = ["banking", "telecommunications", "government", "healthcare", "energy", "retail", "ngo", "education"]
ATTACK_CATEGORIES = [
    "mobile_money_fraud", "sim_swap", "business_email_compromise",
    "phishing_localized", "ransomware", "account_takeover",
    "supply_chain", "data_exfiltration",
]

IP_REGEX = re.compile(
    r"^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$"
)
DOMAIN_REGEX = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)
MD5_REGEX = re.compile(r"^[a-fA-F0-9]{32}$")
SHA256_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class UserCreate(BaseModel):
    email: str
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    organization: Optional[str] = ""


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    role: str
    organization: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class IndicatorCreate(BaseModel):
    indicator_type: str
    value: str
    tlp: str = "GREEN"
    confidence: int = Field(50, ge=0, le=100)
    country_codes: list[str] = []
    sectors: list[str] = []
    attack_categories: list[str] = []
    description: str = Field("", max_length=2000)
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None

    @field_validator("indicator_type")
    @classmethod
    def validate_type(cls, v):
        if v not in INDICATOR_TYPES:
            raise ValueError(f"indicator_type must be one of {INDICATOR_TYPES}")
        return v

    @field_validator("tlp")
    @classmethod
    def validate_tlp(cls, v):
        if v not in TLP_VALUES:
            raise ValueError(f"tlp must be one of {TLP_VALUES}")
        return v

    @field_validator("value")
    @classmethod
    def validate_value(cls, v, info):
        return v.strip()

    @field_validator("country_codes")
    @classmethod
    def validate_countries(cls, v):
        for c in v:
            if c not in AFRICAN_COUNTRY_CODES:
                raise ValueError(f"Country code {c} is not a supported African country")
        return v

    @field_validator("sectors")
    @classmethod
    def validate_sectors(cls, v):
        for s in v:
            if s not in SECTORS:
                raise ValueError(f"Sector {s} is not valid")
        return v

    @field_validator("attack_categories")
    @classmethod
    def validate_attack_categories(cls, v):
        for a in v:
            if a not in ATTACK_CATEGORIES:
                raise ValueError(f"Attack category {a} is not valid")
        return v

    def validate_value_format(self):
        t = self.indicator_type
        v = self.value
        if t == "ip" and not IP_REGEX.match(v):
            raise ValueError("Invalid IP address format")
        elif t == "domain" and not DOMAIN_REGEX.match(v):
            raise ValueError("Invalid domain format")
        elif t == "url":
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("URL must start with http:// or https://")
        elif t == "hash_md5" and not MD5_REGEX.match(v):
            raise ValueError("Invalid MD5 hash format (must be 32 hex chars)")
        elif t == "hash_sha256" and not SHA256_REGEX.match(v):
            raise ValueError("Invalid SHA256 hash format (must be 64 hex chars)")
        elif t == "email" and not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format")


class EnrichmentResultOut(BaseModel):
    id: uuid.UUID
    indicator_id: uuid.UUID
    source: str
    raw_response: dict
    malicious_votes: int
    country: str
    asn: str
    enriched_at: datetime

    model_config = {"from_attributes": True}


class IndicatorOut(BaseModel):
    id: uuid.UUID
    indicator_type: str
    value: str
    tlp: str
    confidence: int
    country_codes: list[str]
    sectors: list[str]
    attack_categories: list[str]
    description: str
    first_seen: datetime
    last_seen: datetime
    enrichment_data: dict
    submitted_by: uuid.UUID
    stix_id: str
    status: str
    created_at: datetime
    enrichment_results: list[EnrichmentResultOut] = []

    model_config = {"from_attributes": True}
