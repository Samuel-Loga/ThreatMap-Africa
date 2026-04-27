import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import (
    User, Forum, Post, Comment, Vote, Badge, UserBadge,
    Workspace, WorkspaceMember, WorkspaceIndicator, Indicator,
)
from app.schemas import (
    ForumCreate, ForumOut, PostCreate, PostOut, CommentCreate, CommentOut,
    VoteCreate, VoteOut, BadgeOut, UserBadgeOut,
    WorkspaceCreate, WorkspaceOut, WorkspaceMemberOut, WorkspaceIndicatorOut,
    LeaderboardEntry,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/community", tags=["community"])

def utcnow(): return datetime.now(timezone.utc)

# ── FORUMS ────────────────────────────────────────────────────────────────────

@router.get("/forums", response_model=list[ForumOut])
async def list_forums(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Forum).where(Forum.is_active == True).order_by(Forum.created_at.desc()))
    return result.scalars().all()


@router.post("/forums", response_model=ForumOut, status_code=status.HTTP_201_CREATED)
async def create_forum(data: ForumCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ("Analyst", "OrgAdmin", "SuperAdmin"):
        raise HTTPException(status_code=403, detail="Only Analysts and above can create forums")
    forum = Forum(id=uuid.uuid4(), title=data.title, description=data.description, created_by=current_user.id, created_at=utcnow())
    db.add(forum)
    await db.commit()
    await db.refresh(forum)
    return forum


# ── POSTS ─────────────────────────────────────────────────────────────────────

@router.get("/forums/{forum_id}/posts", response_model=list[PostOut])
async def list_posts(forum_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Post).where(Post.forum_id == forum_id).order_by(Post.is_pinned.desc(), Post.created_at.desc()))
    return result.scalars().all()


@router.post("/posts", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(data: PostCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    forum = await db.get(Forum, data.forum_id)
    if not forum or not forum.is_active:
        raise HTTPException(status_code=404, detail="Forum not found")
    now = utcnow()
    post = Post(id=uuid.uuid4(), title=data.title, content=data.content, forum_id=data.forum_id, author_id=current_user.id, created_at=now, updated_at=now)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    await _check_and_award_badges(current_user.id, db)
    return post


@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ── COMMENTS ──────────────────────────────────────────────────────────────────

@router.get("/comments", response_model=list[CommentOut])
async def list_comments(
    post_id: Optional[uuid.UUID] = Query(None),
    indicator_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    filters = [Comment.parent_id == None]
    if post_id:
        filters.append(Comment.post_id == post_id)
    if indicator_id:
        filters.append(Comment.indicator_id == indicator_id)
    result = await db.execute(select(Comment).where(and_(*filters)).order_by(Comment.created_at.asc()))
    return result.scalars().all()


@router.post("/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(data: CommentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    now = utcnow()
    comment = Comment(
        id=uuid.uuid4(), content=data.content,
        post_id=data.post_id, indicator_id=data.indicator_id,
        author_id=current_user.id, parent_id=data.parent_id,
        created_at=now, updated_at=now,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    await _check_and_award_badges(current_user.id, db)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id and current_user.role not in ("OrgAdmin", "SuperAdmin"):
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.delete(comment)
    await db.commit()


# ── VOTES ─────────────────────────────────────────────────────────────────────

@router.post("/votes", response_model=VoteOut, status_code=status.HTTP_201_CREATED)
async def cast_vote(data: VoteCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check for existing vote and toggle/change
    filters = [Vote.user_id == current_user.id]
    if data.post_id:
        filters.append(Vote.post_id == data.post_id)
    if data.comment_id:
        filters.append(Vote.comment_id == data.comment_id)
    existing = (await db.execute(select(Vote).where(and_(*filters)))).scalar_one_or_none()

    if existing:
        if existing.vote_type == data.vote_type:
            # Undo vote
            await _adjust_vote_counts(db, data, -1)
            await db.delete(existing)
            await db.commit()
            raise HTTPException(status_code=200, detail="Vote removed")
        else:
            await _adjust_vote_counts(db, data, 1, old_type=existing.vote_type)
            existing.vote_type = data.vote_type
            await db.commit()
            await db.refresh(existing)
            return existing

    vote = Vote(id=uuid.uuid4(), user_id=current_user.id, post_id=data.post_id, comment_id=data.comment_id, vote_type=data.vote_type, created_at=utcnow())
    db.add(vote)
    await _adjust_vote_counts(db, data, 1)
    await db.commit()
    await db.refresh(vote)
    return vote


async def _adjust_vote_counts(db, data: VoteCreate, delta: int, old_type: str = None):
    if data.post_id:
        post = await db.get(Post, data.post_id)
        if post:
            if old_type:
                if old_type == "up": post.upvotes = max(0, post.upvotes - 1)
                else: post.downvotes = max(0, post.downvotes - 1)
            if data.vote_type == "up": post.upvotes += delta
            else: post.downvotes += delta
    if data.comment_id:
        comment = await db.get(Comment, data.comment_id)
        if comment:
            if old_type:
                if old_type == "up": comment.upvotes = max(0, comment.upvotes - 1)
                else: comment.downvotes = max(0, comment.downvotes - 1)
            if data.vote_type == "up": comment.upvotes += delta
            else: comment.downvotes += delta


# ── BADGES & LEADERBOARD ──────────────────────────────────────────────────────

BADGE_DEFINITIONS = [
    {"name": "First Submission", "icon": "🎯", "description": "Submitted your first IOC", "criteria": "indicators>=1"},
    {"name": "Active Contributor", "icon": "🔥", "description": "Submitted 10 or more IOCs", "criteria": "indicators>=10"},
    {"name": "Threat Hunter", "icon": "🦁", "description": "Submitted 50 or more IOCs", "criteria": "indicators>=50"},
    {"name": "Community Voice", "icon": "💬", "description": "Posted 5 or more forum discussions", "criteria": "posts>=5"},
    {"name": "Trusted Analyst", "icon": "🛡️", "description": "Reached a trust score of 40+", "criteria": "trust>=40"},
    {"name": "Elite Defender", "icon": "⭐", "description": "Reached a trust score of 80+", "criteria": "trust>=80"},
    {"name": "Pan-African", "icon": "🌍", "description": "Submitted IOCs covering 5+ African countries", "criteria": "countries>=5"},
]


async def _check_and_award_badges(user_id: uuid.UUID, db: AsyncSession):
    user = await db.get(User, user_id)
    if not user:
        return

    indicator_count = (await db.execute(select(func.count(Indicator.id)).where(Indicator.submitted_by == user_id))).scalar_one()
    post_count = (await db.execute(select(func.count(Post.id)).where(Post.author_id == user_id))).scalar_one()

    # Count distinct countries across all user indicators
    rows = (await db.execute(select(Indicator.country_codes).where(Indicator.submitted_by == user_id))).scalars().all()
    all_countries = set(c for codes in rows for c in (codes or []))

    existing_badges = (await db.execute(
        select(UserBadge).options(selectinload(UserBadge.badge)).where(UserBadge.user_id == user_id)
    )).scalars().all()
    earned_names = {ub.badge.name for ub in existing_badges}

    for defn in BADGE_DEFINITIONS:
        if defn["name"] in earned_names:
            continue
        criteria = defn["criteria"]
        earned = False
        if criteria.startswith("indicators>=") and indicator_count >= int(criteria.split(">=")[1]):
            earned = True
        elif criteria.startswith("posts>=") and post_count >= int(criteria.split(">=")[1]):
            earned = True
        elif criteria.startswith("trust>=") and user.trust_score >= int(criteria.split(">=")[1]):
            earned = True
        elif criteria.startswith("countries>=") and len(all_countries) >= int(criteria.split(">=")[1]):
            earned = True

        if earned:
            badge = (await db.execute(select(Badge).where(Badge.name == defn["name"]))).scalar_one_or_none()
            if not badge:
                badge = Badge(id=uuid.uuid4(), name=defn["name"], description=defn["description"], icon=defn["icon"], criteria=defn["criteria"], created_at=utcnow())
                db.add(badge)
                await db.flush()
            db.add(UserBadge(id=uuid.uuid4(), user_id=user_id, badge_id=badge.id, awarded_at=utcnow()))

    await db.commit()


@router.get("/badges/me", response_model=list[UserBadgeOut])
async def my_badges(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _check_and_award_badges(current_user.id, db)
    result = await db.execute(
        select(UserBadge).options(selectinload(UserBadge.badge)).where(UserBadge.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    badge_counts = (await db.execute(
        select(UserBadge.user_id, func.count(UserBadge.id).label("badge_count")).group_by(UserBadge.user_id)
    )).all()
    badge_map = {str(r.user_id): r.badge_count for r in badge_counts}

    users = (await db.execute(
        select(User).where(User.is_active == True).order_by(desc(User.reputation_points)).limit(limit)
    )).scalars().all()

    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=u.id,
            username=u.username,
            organization=u.organization,
            reputation_points=u.reputation_points,
            trust_score=u.trust_score,
            verification_level=u.verification_level,
            badge_count=badge_map.get(str(u.id), 0),
        )
        for i, u in enumerate(users)
    ]


# ── WORKSPACES ────────────────────────────────────────────────────────────────

@router.get("/workspaces", response_model=list[WorkspaceOut])
async def list_workspaces(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Return workspaces where user is owner or member
    owned = (await db.execute(select(Workspace).options(selectinload(Workspace.members)).where(Workspace.owner_id == current_user.id))).scalars().all()
    member_ws_ids = (await db.execute(select(WorkspaceMember.workspace_id).where(WorkspaceMember.user_id == current_user.id))).scalars().all()
    member_ws = []
    if member_ws_ids:
        member_ws = (await db.execute(select(Workspace).options(selectinload(Workspace.members)).where(Workspace.id.in_(member_ws_ids)))).scalars().all()
    seen = {w.id for w in owned}
    return owned + [w for w in member_ws if w.id not in seen]


@router.post("/workspaces", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
async def create_workspace(data: WorkspaceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = Workspace(id=uuid.uuid4(), name=data.name, description=data.description, owner_id=current_user.id, created_at=utcnow())
    db.add(ws)
    await db.flush()
    db.add(WorkspaceMember(id=uuid.uuid4(), workspace_id=ws.id, user_id=current_user.id, role="owner", joined_at=utcnow()))
    await db.commit()
    await db.refresh(ws)
    return ws


@router.post("/workspaces/{ws_id}/members", response_model=WorkspaceMemberOut, status_code=status.HTTP_201_CREATED)
async def add_member(ws_id: uuid.UUID, payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = await db.get(Workspace, ws_id)
    if not ws or ws.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the workspace owner can add members")
    user_email = payload.get("email", "")
    target = (await db.execute(select(User).where(User.email == user_email))).scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    existing = (await db.execute(select(WorkspaceMember).where(and_(WorkspaceMember.workspace_id == ws_id, WorkspaceMember.user_id == target.id)))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    member = WorkspaceMember(id=uuid.uuid4(), workspace_id=ws_id, user_id=target.id, role="member", joined_at=utcnow())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/workspaces/{ws_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(ws_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    ws = await db.get(Workspace, ws_id)
    if not ws or ws.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the workspace owner can remove members")
    member = (await db.execute(select(WorkspaceMember).where(and_(WorkspaceMember.workspace_id == ws_id, WorkspaceMember.user_id == user_id)))).scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    await db.delete(member)
    await db.commit()


@router.get("/workspaces/{ws_id}/indicators", response_model=list[WorkspaceIndicatorOut])
async def list_workspace_indicators(ws_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _assert_member(ws_id, current_user.id, db)
    result = await db.execute(select(WorkspaceIndicator).where(WorkspaceIndicator.workspace_id == ws_id))
    return result.scalars().all()


@router.post("/workspaces/{ws_id}/indicators", response_model=WorkspaceIndicatorOut, status_code=status.HTTP_201_CREATED)
async def add_indicator_to_workspace(ws_id: uuid.UUID, payload: dict, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _assert_member(ws_id, current_user.id, db)
    indicator_id = payload.get("indicator_id")
    if not indicator_id:
        raise HTTPException(status_code=400, detail="indicator_id required")
    existing = (await db.execute(select(WorkspaceIndicator).where(and_(WorkspaceIndicator.workspace_id == ws_id, WorkspaceIndicator.indicator_id == indicator_id)))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Indicator already in workspace")
    wi = WorkspaceIndicator(id=uuid.uuid4(), workspace_id=ws_id, indicator_id=indicator_id, added_by=current_user.id, added_at=utcnow())
    db.add(wi)
    await db.commit()
    await db.refresh(wi)
    return wi


@router.delete("/workspaces/{ws_id}/indicators/{indicator_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_indicator_from_workspace(ws_id: uuid.UUID, indicator_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _assert_member(ws_id, current_user.id, db)
    wi = (await db.execute(select(WorkspaceIndicator).where(and_(WorkspaceIndicator.workspace_id == ws_id, WorkspaceIndicator.indicator_id == indicator_id)))).scalar_one_or_none()
    if not wi:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(wi)
    await db.commit()


async def _assert_member(ws_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession):
    ws = await db.get(Workspace, ws_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if ws.owner_id == user_id:
        return
    member = (await db.execute(select(WorkspaceMember).where(and_(WorkspaceMember.workspace_id == ws_id, WorkspaceMember.user_id == user_id)))).scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a workspace member")
