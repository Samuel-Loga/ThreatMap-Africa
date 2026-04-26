import logging
from sqlalchemy import select, func
from app.database import SyncSessionLocal
from app.models import User, Indicator

logger = logging.getLogger(__name__)

def update_user_reputation(user_id: str):
    with SyncSessionLocal() as db:
        user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
        if not user:
            return
            
        # Count indicators submitted by user
        count_res = db.execute(select(func.count(Indicator.id)).where(Indicator.submitted_by == user.id))
        count = count_res.scalar_one()
        
        # Simple reputation logic: 10 points per submission
        user.reputation_points = count * 10
        
        # Simple trust score logic: 
        # Base: 10
        # +1 per 50 reputation points (max 50)
        # +20 if profile is fully completed (all onboarding fields)
        # +20 if verification level is high (manually set usually, but here we can simulate)
        
        base_trust = 10
        rep_bonus = min(user.reputation_points // 50, 50)
        
        onboarding_bonus = 20 if user.onboarding_completed else 0
        
        # Check if basic identity info is provided
        identity_bonus = 0
        if user.full_name and user.organization and user.org_type:
            identity_bonus = 10
            
        user.trust_score = min(base_trust + rep_bonus + onboarding_bonus + identity_bonus, 100)
        
        # Update verification level based on trust score
        if user.trust_score >= 80:
            user.verification_level = "trusted"
        elif user.trust_score >= 40:
            user.verification_level = "verified"
        else:
            user.verification_level = "unverified"
            
        db.add(user)
        db.commit()
        logger.info(f"Updated reputation for user {user.username}: points={user.reputation_points}, trust={user.trust_score}")
