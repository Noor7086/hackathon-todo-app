"""Vercel serverless function adapter for the FastAPI backend."""

import os
import sys

# Add the backend directory to the Python path so 'src' package resolves
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum  # noqa: E402

from src.main import app  # noqa: E402

handler = Mangum(app, lifespan="off")
