"""Vercel serverless function adapter for the FastAPI backend."""

import os
import sys

# Add the backend directory to the Python path so 'src' package resolves
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from src.main import app  # noqa: E402 — FastAPI ASGI app, Vercel picks this up
from src.database import create_db_and_tables  # noqa: E402

# Create tables explicitly (lifespan events may not run in serverless)
create_db_and_tables()
