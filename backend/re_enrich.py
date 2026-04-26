import sys
import os
import uuid
from sqlalchemy import select

# Add current directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SyncSessionLocal
from app.models import Indicator
from app.worker.tasks import enrich_indicator

def re_enrich_all():
    print("Starting re-enrichment of all indicators...")
    count = 0
    with SyncSessionLocal() as db:
        result = db.execute(select(Indicator.id))
        indicator_ids = result.scalars().all()
        
        for ind_id in indicator_ids:
            print(f"Queueing enrichment for: {ind_id}")
            enrich_indicator.delay(str(ind_id))
            count += 1
            
    print(f"Queued {count} indicators for enrichment.")

if __name__ == "__main__":
    re_enrich_all()
