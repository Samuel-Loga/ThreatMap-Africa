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
    forums: Mapped[list["Forum"]] = relationship(
        "Forum",
        back_populates="creator",
        lazy="noload",
    )
    posts: Mapped[list["Post"]] = relationship(
        "Post",
        back_populates="author",
        lazy="noload",
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="author",
        lazy="noload",
    )
    votes: Mapped[list["Vote"]] = relationship(
        "Vote",
        back_populates="user",
        lazy="noload",
    )
    user_badges: Mapped[list["UserBadge"]] = relationship(
        "UserBadge",
        back_populates="user",
        lazy="noload",
    )


class Indicator(Base):
    __tablename__ = "indicators"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    indicator_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    tlp: Mapped[str] = mapped_column(String(10), default="GREEN", nullable=False, index=True)
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
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
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


class Forum(Base):
    __tablename__ = "forums"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    creator: Mapped["User"] = relationship("User", back_populates="forums", lazy="selectin")
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="forum", lazy="selectin")


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    forum_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("forums.id"), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    downvotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    forum: Mapped["Forum"] = relationship("Forum", back_populates="posts", lazy="selectin")
    author: Mapped["User"] = relationship("User", back_populates="posts", lazy="selectin")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="post", lazy="selectin")
    votes: Mapped[list["Vote"]] = relationship("Vote", back_populates="post", lazy="selectin")


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=True)
    indicator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("indicators.id"), nullable=True)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)  # For nested comments
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    downvotes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    post: Mapped["Post"] = relationship("Post", back_populates="comments", lazy="selectin")
    indicator: Mapped["Indicator"] = relationship("Indicator", back_populates="comments", lazy="selectin")
    author: Mapped["User"] = relationship("User", back_populates="comments", lazy="selectin")
    parent: Mapped["Comment"] = relationship("Comment", remote_side=[id], back_populates="replies", lazy="selectin")
    replies: Mapped[list["Comment"]] = relationship("Comment", back_populates="parent", lazy="selectin")
    votes: Mapped[list["Vote"]] = relationship("Vote", back_populates="comment", lazy="selectin")


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    post_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("posts.id"), nullable=True)
    comment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)
    vote_type: Mapped[str] = mapped_column(String(10), nullable=False)  # 'up' or 'down'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="votes", lazy="selectin")
    post: Mapped["Post"] = relationship("Post", back_populates="votes", lazy="selectin")
    comment: Mapped["Comment"] = relationship("Comment", back_populates="votes", lazy="selectin")


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    owner: Mapped["User"] = relationship("User", lazy="selectin")
    members: Mapped[list["WorkspaceMember"]] = relationship("WorkspaceMember", back_populates="workspace", lazy="selectin")
    indicators: Mapped[list["WorkspaceIndicator"]] = relationship("WorkspaceIndicator", back_populates="workspace", lazy="selectin")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="member", nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="members", lazy="selectin")
    user: Mapped["User"] = relationship("User", lazy="selectin")


class WorkspaceIndicator(Base):
    __tablename__ = "workspace_indicators"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"), nullable=False)
    indicator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("indicators.id"), nullable=False)
    added_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="indicators", lazy="selectin")
    indicator: Mapped["Indicator"] = relationship("Indicator", lazy="selectin")


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    criteria: Mapped[str] = mapped_column(Text, nullable=False)  # JSON or text describing how to earn
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user_badges: Mapped[list["UserBadge"]] = relationship(
        "UserBadge",
        back_populates="badge",
        lazy="selectin",
    )


class UserBadge(Base):
    __tablename__ = "user_badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    badge_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False)
    awarded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="user_badges", lazy="selectin")
    badge: Mapped["Badge"] = relationship("Badge", back_populates="user_badges", lazy="selectin")
