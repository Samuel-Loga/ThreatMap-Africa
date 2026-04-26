import io
import base64
import pyotp
import qrcode
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, Token, UserUpdate, LoginResponse
from app.auth import get_password_hash, verify_password, create_access_token, decode_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    result = await db.execute(select(User).where(User.username == user_in.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        organization=user_in.organization or "",
        role="Contributor",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/token", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # If 2FA is enabled, return a short-lived pre-auth token instead of full access
    if user.two_factor_enabled and user.totp_secret:
        pre_auth_token = create_access_token(
            {"sub": str(user.id), "type": "pre_auth"},
            expires_delta=__import__("datetime").timedelta(minutes=5),
        )
        return LoginResponse(
            requires_2fa=True,
            pre_auth_token=pre_auth_token,
            access_token=None,
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "username": user.username,
        "onboarding_completed": user.onboarding_completed,
    })
    return LoginResponse(
        access_token=token,
        requires_2fa=False,
        pre_auth_token=None,
    )


@router.post("/2fa/verify", response_model=Token)
async def verify_2fa_login(payload: dict, db: AsyncSession = Depends(get_db)):
    pre_auth_token = payload.get("pre_auth_token", "")
    code = payload.get("code", "")

    decoded = decode_token(pre_auth_token)
    if not decoded or decoded.get("type") != "pre_auth":
        raise HTTPException(status_code=401, detail="Invalid or expired 2FA session")

    result = await db.execute(select(User).where(User.id == decoded["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "username": user.username,
        "onboarding_completed": user.onboarding_completed,
    })
    return Token(access_token=token)


@router.post("/2fa/setup")
async def setup_2fa(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Generate a new TOTP secret and return QR code for the authenticator app."""
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=current_user.email, issuer_name="ThreatMap Africa")

    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf)
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    # Store secret temporarily — only activated after user confirms with a valid code
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()
    user.totp_secret = secret
    await db.commit()

    return {"qr_code": f"data:image/png;base64,{qr_b64}", "secret": secret}


@router.post("/2fa/verify-setup")
async def verify_2fa_setup(payload: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Confirm the TOTP code from the authenticator app and enable 2FA."""
    code = payload.get("code", "")
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()

    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA setup not initiated. Call /2fa/setup first.")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    user.two_factor_enabled = True
    await db.commit()
    return {"message": "2FA enabled successfully"}


@router.post("/2fa/disable")
async def disable_2fa(payload: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Disable 2FA after verifying current password."""
    password = payload.get("password", "")
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()
    user.two_factor_enabled = False
    user.totp_secret = ""
    await db.commit()
    return {"message": "2FA disabled successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_me(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    from app.worker.tasks import calculate_user_reputation
    calculate_user_reputation.delay(str(current_user.id))

    return current_user
