import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Indicator, User
from app.schemas import IndicatorCreate, IndicatorOut
from app.dependencies import get_current_user
from app.worker.tasks import enrich_indicator

router = APIRouter(prefix="/api/v1/indicators", tags=["indicators"])

PRIVATE_IP_RANGES = [
    ("10.0.0.0", "10.255.255.255"),
    ("172.16.0.0", "172.31.255.255"),
    ("192.168.0.0", "192.168.255.255"),
    ("127.0.0.0", "127.255.255.255"),
    ("169.254.0.0", "169.254.255.255"),
    ("0.0.0.0", "0.255.255.255"),
]


def ip_to_int(ip: str) -> int:
    parts = ip.split(".")
    result = 0
    for p in parts:
        result = result * 256 + int(p)
    return result


def is_private_ip(ip: str) -> bool:
    try:
        ip_int = ip_to_int(ip)
        for start, end in PRIVATE_IP_RANGES:
            if ip_to_int(start) <= ip_int <= ip_to_int(end):
                return True
    except Exception:
        pass
    return False


@router.post("", response_model=IndicatorOut, status_code=status.HTTP_201_CREATED)
async def create_indicator(
    indicator_in: IndicatorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        indicator_in.validate_value_format()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if indicator_in.indicator_type == "ip" and is_private_ip(indicator_in.value):
        raise HTTPException(status_code=400, detail="Private IP addresses are not allowed")

    one_hour_ago = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count(Indicator.id)).where(
            and_(
                Indicator.submitted_by == current_user.id,
                Indicator.created_at >= one_hour_ago,
            )
        )
    )
    hourly_count = count_result.scalar_one()
    if hourly_count >= 100:
        raise HTTPException(status_code=429, detail="Rate limit: 100 submissions per hour")

    now = datetime.now(timezone.utc)
    indicator_id = uuid.uuid4()
    indicator = Indicator(
        id=indicator_id,
        indicator_type=indicator_in.indicator_type,
        value=indicator_in.value,
        tlp=indicator_in.tlp,
        severity=indicator_in.severity,
        confidence=indicator_in.confidence,
        country_codes=indicator_in.country_codes,
        sectors=indicator_in.sectors,
        attack_categories=indicator_in.attack_categories,
        description=indicator_in.description,
        first_seen=indicator_in.first_seen or now,
        last_seen=indicator_in.last_seen or now,
        submitted_by=current_user.id,
        stix_id=f"indicator--{indicator_id}",
        status="pending",
        enrichment_data={},
    )
    db.add(indicator)
    await db.commit()
    await db.refresh(indicator)

    enrich_indicator.delay(str(indicator.id))

    return indicator


@router.get("", response_model=list[IndicatorOut])
async def list_indicators(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    attack_category: Optional[str] = Query(None),
    indicator_type: Optional[str] = Query(None),
    tlp: Optional[str] = Query(None),
    since: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Indicator).options(selectinload(Indicator.enrichment_results))
    filters = []
    if indicator_type:
        filters.append(Indicator.indicator_type == indicator_type)
    if tlp:
        filters.append(Indicator.tlp == tlp)
    if since:
        filters.append(Indicator.created_at >= since)
    if country:
        filters.append(Indicator.country_codes.any(country))
    if sector:
        filters.append(Indicator.sectors.any(sector))
    if attack_category:
        filters.append(Indicator.attack_categories.any(attack_category))
    if filters:
        stmt = stmt.where(and_(*filters))
    stmt = stmt.order_by(Indicator.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    indicators = result.scalars().all()
    return indicators


@router.get("/{indicator_id}", response_model=IndicatorOut)
async def get_indicator(
    indicator_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Indicator)
        .options(selectinload(Indicator.enrichment_results))
        .where(Indicator.id == indicator_id)
    )
    indicator = result.scalar_one_or_none()
    if not indicator:
        raise HTTPException(status_code=404, detail="Indicator not found")
    return indicator
