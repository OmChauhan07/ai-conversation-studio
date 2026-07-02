"""
SQLAlchemy async engine and session factory for Neon PostgreSQL.

Uses the DATABASE_URL from .env with SSL required (Neon enforces sslmode=require).
The connection string is adapted from the Prisma-style URL to work with
SQLAlchemy's create_engine by replacing the query-string separator.
"""

import os
import logging

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base, Session

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── Build the connection URL ────────────────────────────────────────────
_raw_url = os.getenv("DATABASE_URL", "")

# Prisma uses '&' in query strings but stores URLs with quotes;
# strip surrounding quotes if present, and replace the JS-style
# `&` with `&` so urllib can parse it correctly.
DATABASE_URL = _raw_url.strip('"').replace("&", "&")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Add it to backend-ai/.env  (e.g. postgresql://user:pass@host/db?sslmode=require)"
    )

# Neon requires SSL — make sure the driver arg is present.
# psycopg2-binary is already in requirements.txt.
# Remove channel_binding param if present (not supported by psycopg2 connect_args).
if "channel_binding" in DATABASE_URL:
    # Remove channel_binding parameter from the URL
    import re
    DATABASE_URL = re.sub(r'[&?]channel_binding=[^&]*', '', DATABASE_URL)
    # Clean up potential double ? or trailing ?
    DATABASE_URL = DATABASE_URL.rstrip('?').rstrip('&')
    if '?' not in DATABASE_URL and 'sslmode' in _raw_url:
        DATABASE_URL += '?sslmode=require'


# ── Engine & Session ────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,       # reconnect stale connections automatically
    pool_recycle=300,          # recycle connections every 5 min (Neon idle timeout)
    echo=False,               # set True for SQL debug logging
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# ── Declarative Base ────────────────────────────────────────────────────
Base = declarative_base()


# ── FastAPI dependency ──────────────────────────────────────────────────
def get_db() -> Session:
    """
    Yield a SQLAlchemy session for a single request, then close it.

    Usage in a FastAPI route:
        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
