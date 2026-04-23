import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.database import get_db
from app.models import Indicator
from app.dependencies import get_current_user
from app.models import User
import stix2

router = APIRouter(prefix="/api/v1/export", tags=["export"])

ThreatMapExtension = stix2.properties.ExtensionsProperty


def indicator_to_stix(indicator: Indicator) -> dict:
    ext = {
        "extension_type": "property-extension",
        "tlp": indicator.tlp,
        "confidence": indicator.confidence,
        "country_codes": indicator.country_codes,
        "sectors": indicator.sectors,
        "attack_categories": indicator.attack_categories,
        "submitted_by": str(indicator.submitted_by),
        "status": indicator.status,
    }

    pattern = ""
    itype = indicator.indicator_type
    val = indicator.value.replace("'", "\\'")
    if itype == "ip":
        pattern = f"[ipv4-addr:value = '{val}']"
    elif itype == "domain":
        pattern = f"[domain-name:value = '{val}']"
    elif itype == "url":
        pattern = f"[url:value = '{val}']"
    elif itype == "hash_md5":
        pattern = f"[file:hashes.MD5 = '{val}']"
    elif itype == "hash_sha256":
        pattern = f"[file:hashes.'SHA-256' = '{val}']"
    elif itype == "email":
        pattern = f"[email-addr:value = '{val}']"
    else:
        pattern = f"[artifact:payload_bin = '{val}']"

    stix_indicator = {
        "type": "indicator",
        "spec_version": "2.1",
        "id": indicator.stix_id if indicator.stix_id else f"indicator--{uuid.uuid4()}",
        "created": indicator.created_at.isoformat(),
        "modified": indicator.last_seen.isoformat(),
        "name": f"{itype}: {indicator.value[:100]}",
        "description": indicator.description,
        "pattern": pattern,
        "pattern_type": "stix",
        "valid_from": indicator.first_seen.isoformat(),
        "confidence": indicator.confidence,
        "extensions": {
            "extension-definition--d4d2c6b4-7f5a-4d6b-8e8a-1e2f3a4b5c6d": ext
        },
    }
    return stix_indicator


@router.get("/stix")
async def export_stix(
    country: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    attack_category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Indicator)
    filters = []
    if country:
        filters.append(Indicator.country_codes.any(country))
    if sector:
        filters.append(Indicator.sectors.any(sector))
    if attack_category:
        filters.append(Indicator.attack_categories.any(attack_category))
    if filters:
        stmt = stmt.where(and_(*filters))
    stmt = stmt.order_by(Indicator.created_at.desc()).limit(1000)
    result = await db.execute(stmt)
    indicators = result.scalars().all()

    ext_def = {
        "type": "extension-definition",
        "spec_version": "2.1",
        "id": "extension-definition--d4d2c6b4-7f5a-4d6b-8e8a-1e2f3a4b5c6d",
        "created": "2024-01-01T00:00:00Z",
        "modified": "2024-01-01T00:00:00Z",
        "name": "ThreatMap Africa Extension",
        "description": "Custom extension for African threat intelligence context",
        "schema": "https://threatmap.africa/extensions/v1",
        "version": "1.0",
        "extension_types": ["property-extension"],
    }

    objects = [ext_def] + [indicator_to_stix(i) for i in indicators]

    bundle = {
        "type": "bundle",
        "id": f"bundle--{uuid.uuid4()}",
        "spec_version": "2.1",
        "objects": objects,
    }
    return JSONResponse(content=bundle, media_type="application/json")
