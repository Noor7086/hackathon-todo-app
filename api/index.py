"""Vercel serverless function adapter for the FastAPI backend."""

import os
import sys
import traceback

# Add the backend directory to the Python path so 'src' package resolves
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

_init_error = None

try:
    from mangum import Mangum  # noqa: E402

    from src.main import app  # noqa: E402
    from src.database import create_db_and_tables  # noqa: E402

    # In serverless, lifespan events don't run, so create tables explicitly
    create_db_and_tables()

    handler = Mangum(app, lifespan="off")

except Exception:
    _init_error = traceback.format_exc()

    # Return the actual error so we can debug it
    async def handler(scope, receive, send):  # type: ignore[misc]
        if scope["type"] == "http":
            body = f"Startup error:\n\n{_init_error}".encode()
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    [b"content-type", b"text/plain; charset=utf-8"],
                    [b"content-length", str(len(body)).encode()],
                ],
            })
            await send({"type": "http.response.body", "body": body})
