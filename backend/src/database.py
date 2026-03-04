"""Database connection and session management."""

import os
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

from src.config import get_settings

settings = get_settings()

# Create engine with appropriate settings for the database type
_engine_kwargs = {
    "echo": False,
}

is_sqlite = settings.database_url.startswith("sqlite")
is_serverless = os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")

if not is_sqlite:
    if is_serverless:
        # Serverless: disable pooling to avoid connection exhaustion
        from sqlalchemy.pool import NullPool
        _engine_kwargs["poolclass"] = NullPool
    else:
        _engine_kwargs.update(
            {
                "pool_pre_ping": True,
                "pool_size": 5,
                "max_overflow": 10,
            }
        )

engine = create_engine(settings.database_url, **_engine_kwargs)


def create_db_and_tables() -> None:
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Provide a database session as a FastAPI dependency."""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
