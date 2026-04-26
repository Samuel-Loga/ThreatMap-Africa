import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Indicator

router = APIRouter(prefix="/taxii", tags=["taxii"])

COLLECTION_ID = "af1c2b3d-4e5f-6789-abcd-ef0123456789"
TAXII_MEDIA_TYPE = "application/taxii+json;version=2.1"


@router.get("/")
async def taxii_discovery():
    return JSONResponse(
        content={
            "title": "ThreatMap Africa TAXII Server",
            "description": "TAXII 2.1 server for African threat intelligence",
            "contact": "admin@threatmap.africa",
            "default": f"/taxii/collections/{COLLECTION_ID}/",
            "api_roots": ["/taxii/"],
        },
        media_type=TAXII_MEDIA_TYPE,
    )


@router.get("/collections/")
async def list_collections():
    return JSONResponse(
        content={
            "collections": [
                {
                    "id": COLLECTION_ID,
                    "title": "ThreatMap Africa Indicators",
                    "description": "African cyber threat indicators",
                    "can_read": True,
                    "can_write": False,
                    "media_types": ["application/stix+json;version=2.1"],
                }
            ]
        },
        media_type=TAXII_MEDIA_TYPE,
    )


@router.get("/collections/{collection_id}/objects/")
async def get_objects(collection_id: str, db: AsyncSession = Depends(get_db)):
    if collection_id != COLLECTION_ID:
        return JSONResponse(content={"objects": []}, media_type=TAXII_MEDIA_TYPE)

    result = await db.execute(select(Indicator).order_by(Indicator.created_at.desc()).limit(100))
    indicators = result.scalars().all()

    objects = []
    for ind in indicators:
        val = ind.value.replace("'", "\\'")
        itype = ind.indicator_type
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

        objects.append({
            "type": "indicator",
            "spec_version": "2.1",
            "id": ind.stix_id or f"indicator--{uuid.uuid4()}",
            "created": ind.created_at.isoformat(),
            "modified": ind.last_seen.isoformat(),
            "name": f"{itype}: {ind.value[:100]}",
            "pattern": pattern,
            "pattern_type": "stix",
            "valid_from": ind.first_seen.isoformat(),
            "confidence": ind.confidence,
        })

    return JSONResponse(
        content={"objects": objects},
        media_type=TAXII_MEDIA_TYPE,
    )
