"""Vercel serverless function adapter for the FastAPI backend."""

import os
import sys

# Add the backend directory to the Python path so 'src' package resolves
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum  # noqa: E402

from src.main import app  # noqa: E402
from src.database import create_db_and_tables  # noqa: E402

# In serverless, lifespan events don't run, so create tables explicitly
create_db_and_tables()

handler = Mangum(app, lifespan="off")
