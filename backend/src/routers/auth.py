"""Authentication endpoints."""

import hashlib
import re
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException
from jose import jwt
from pydantic import BaseModel
from sqlmodel import select

from src.config import get_settings
from src.database import SessionDep
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    user_id: str
    email: str
    name: str
    token: str


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}:{hashed.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, stored_hash = stored.split(":")
        new_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
        return new_hash.hex() == stored_hash
    except Exception:
        return False


def _make_token(user_id: str, email: str) -> str:
    settings = get_settings()
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")


def _user_id(email: str) -> str:
    return "user_" + re.sub(r"[^a-zA-Z0-9]", "_", email)


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, session: SessionDep) -> AuthResponse:
    """Register a new user account."""
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=_hash_password(data.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    user_id = _user_id(data.email)
    return AuthResponse(
        user_id=user_id,
        email=user.email,
        name=user.name,
        token=_make_token(user_id, user.email),
    )


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, session: SessionDep) -> AuthResponse:
    """Login with email and password."""
    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user or not _verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = _user_id(user.email)
    return AuthResponse(
        user_id=user_id,
        email=user.email,
        name=user.name,
        token=_make_token(user_id, user.email),
    )
