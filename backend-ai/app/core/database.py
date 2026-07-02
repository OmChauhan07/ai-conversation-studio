import os
import urllib.parse
import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured.")

# Convert postgres:// -> postgresql:// (for SQLAlchemy)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql://",
        1
    )

# Remove unsupported Prisma parameter if present
if "channel_binding" in DATABASE_URL:
    parsed = urllib.parse.urlparse(DATABASE_URL)
    query = urllib.parse.parse_qs(parsed.query)

    query.pop("channel_binding", None)

    parsed = parsed._replace(
        query=urllib.parse.urlencode(query, doseq=True)
    )

    DATABASE_URL = urllib.parse.urlunparse(parsed)

# Neon requires SSL
connect_args = {}

if "neon.tech" in DATABASE_URL:
    connect_args["sslmode"] = "require"

# Create SQLAlchemy Engine
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )

    logger.info("Database engine initialized successfully.")

except Exception:
    logger.exception("Failed to initialize database engine.")
    raise

# SQLAlchemy Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base Model
Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()