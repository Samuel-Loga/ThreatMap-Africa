import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


INDICATOR_TYPES = ["ip", "domain", "url", "hash_md5", "hash_sha256", "email"]
TLP_VALUES = ["WHITE", "GREEN", "AMBER", "RED"]
SEVERITY_VALUES = ["Info", "Low", "Medium", "High", "Critical"]
ROLES = ["Viewer", "Contributor", "Analyst", "OrgAdmin", "SuperAdmin"]
AFRICAN_COUNTRY_CODES = [
    "NG", "KE", "ZA", "GH", "ET", "TZ", "EG", "MA", "SN", "RW",
    "CM", "UG", "ZM", "CI", "DZ", "AO", "BF", "BI", "BJ", "BW",
    "CD", "CF", "CG", "CV", "DJ", "ER", "GA", "GM", "GN", "GQ",
    "GW", "KM", "LR", "LS", "LY", "MG", "ML", "MR", "MU", "MW",
    "MZ", "NA", "NE", "SC", "SD", "SL", "SO", "SS", "ST", "SZ",
    "TD", "TG", "TN", "ZW",
]
SECTORS = ["Banking", "Telecommunications", "Government", "Healthcare", "Energy", "Retail", "NGO", "Education"]
ATTACK_CATEGORIES = [
    "Phishing", "Business Email Compromise", "Mobile Money Fraud", "SIM Swap", 
    "Ransomware", "Data Exfiltration", "DDoS", "SSH Brute Force", 
    "Supply Chain Attack", "Credential Stuffing", "Social Engineering", 
    "Malware Distribution", "Cryptojacking", "SQL Injection", "XSS", 
    "API Abuse", "Other"
]

IP_REGEX = re.compile(
    r"^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$"
)
MD5_REGEX = re.compile(r"^[a-fA-F0-9]{32}$")
SHA256_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_LABEL_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]?$|^[a-zA-Z0-9]$")
_TLD_RE = re.compile(r"^[a-zA-Z]{2,}$")


def is_valid_domain(value: str) -> bool:
    """Validate a domain using split-based approach to avoid regex ReDoS."""
    parts = value.split(".")
    if len(parts) < 2:
        return False
    tld = parts[-1]
    if not _TLD_RE.match(tld):
        return False
    return all(_LABEL_RE.match(label) for label in parts[:-1] if label)


def is_valid_email(value: str) -> bool:
    """Validate an email using split-based approach to avoid regex ReDoS."""
    at_parts = value.split("@")
    if len(at_parts) != 2:
        return False
    local, domain = at_parts
    if not local or len(local) > 254:
        return False
    return is_valid_domain(domain)


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
    org_type: str
    department: str
    experience_level: str
    interests: list[str]
    phone_number: str
    email_notif: bool
    sms_notif: bool
    push_notif: bool
    update_frequency: str
    full_name: str
    profile_pic: str
    pgp_key: str
    two_factor_enabled: bool
    region_state: str
    city: str
    data_sharing_consent: bool
    onboarding_completed: bool
    trust_score: int
    reputation_points: int
    verification_level: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    organization: Optional[str] = None
    org_type: Optional[str] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    interests: Optional[list[str]] = None
    phone_number: Optional[str] = None
    email_notif: Optional[bool] = None
    sms_notif: Optional[bool] = None
    push_notif: Optional[bool] = None
    update_frequency: Optional[str] = None
    full_name: Optional[str] = None
    profile_pic: Optional[str] = None
    pgp_key: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    region_state: Optional[str] = None
    city: Optional[str] = None
    data_sharing_consent: Optional[bool] = None
    onboarding_completed: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    """Response for login endpoint - handles both direct login and 2FA required scenarios"""
    access_token: Optional[str] = None
    token_type: str = "bearer"
    requires_2fa: bool = False
    pre_auth_token: Optional[str] = None


class IndicatorCreate(BaseModel):
    indicator_type: str
    value: str
    tlp: str = "GREEN"
    severity: str = "Medium"
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

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v):
        if v not in SEVERITY_VALUES:
            raise ValueError(f"severity must be one of {SEVERITY_VALUES}")
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
        elif t == "domain" and not is_valid_domain(v):
            raise ValueError("Invalid domain format")
        elif t == "url":
            if not (v.startswith("http://") or v.startswith("https://")):
                raise ValueError("URL must start with http:// or https://")
        elif t == "hash_md5" and not MD5_REGEX.match(v):
            raise ValueError("Invalid MD5 hash format (must be 32 hex chars)")
        elif t == "hash_sha256" and not SHA256_REGEX.match(v):
            raise ValueError("Invalid SHA256 hash format (must be 64 hex chars)")
        elif t == "email" and not is_valid_email(v):
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
    severity: str
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
