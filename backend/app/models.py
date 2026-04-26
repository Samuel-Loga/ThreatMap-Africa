import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Viewer", nullable=False)
    organization: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    org_type: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    department: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    experience_level: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    interests: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)
    phone_number: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    email_notif: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sms_notif: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    push_notif: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    update_frequency: Mapped[str] = mapped_column(String(50), default="daily", nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    profile_pic: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    pgp_key: Mapped[str] = mapped_column(Text, default="", nullable=False)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    totp_secret: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    region_state: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    city: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    data_sharing_consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trust_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reputation_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verification_level: Mapped[str] = mapped_column(String(50), default="unverified", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    indicators: Mapped[list["Indicator"]] = relationship(
        "Indicator",
        back_populates="submitter",
        lazy="noload",
    )


class Indicator(Base):
    __tablename__ = "indicators"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    tlp: Mapped[str] = mapped_column(String(10), default="GREEN", nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), default="Low", nullable=False, index=True)
    confidence: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    country_codes: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)
    sectors: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)
    attack_categories: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="Medium", nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    enrichment_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    submitted_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stix_id: Mapped[str] = mapped_column(Text, default="", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    submitter: Mapped["User"] = relationship("User", back_populates="indicators", lazy="selectin")
    enrichment_results: Mapped[list["EnrichmentResult"]] = relationship(
        "EnrichmentResult",
        back_populates="indicator",
        lazy="selectin",
    )


class EnrichmentResult(Base):
    __tablename__ = "enrichment_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("indicators.id"), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    raw_response: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    malicious_votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    asn: Mapped[str] = mapped_column(String(200), default="", nullable=False)
    enriched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    indicator: Mapped["Indicator"] = relationship(
        "Indicator",
        back_populates="enrichment_results",
        lazy="selectin",
    )
