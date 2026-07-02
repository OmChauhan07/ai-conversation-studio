import os
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# 1. Fetch DATABASE_URL from environment or fallback
DATABASE_URL = os.environ.get(
    "DATABASE_URL", 
    "postgres://postgres:password@localhost:5432/mydb"
)

# 2. Neon Postgres (and many Prisma connections) use connection parameters 
# that psycopg2 (the default Postgres driver for SQLAlchemy if using postgresql://) 
# or asyncpg might not understand directly, such as pgbouncer or channel_binding.
# For SQLAlchemy with psycopg2, we need to ensure the schema is postgresql:// 
# and strip unsupported params.

# Fix the schema for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Strip out channel_binding if present (Prisma specific config that crashes psycopg2)
if "channel_binding" in DATABASE_URL:
    parts = urllib.parse.urlparse(DATABASE_URL)
    query_params = urllib.parse.parse_qs(parts.query)
    if "channel_binding" in query_params:
        del query_params["channel_binding"]
    new_query = urllib.parse.urlencode(query_params, doseq=True)
    parts = parts._replace(query=new_query)
    DATABASE_URL = urllib.parse.urlunparse(parts)

# Neon requires SSL
connect_args = {"sslmode": "require"} if "neon.tech" in DATABASE_URL else {}

# 3. Create the SQLAlchemy engine
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
except Exception as e:
    print(f"Error creating database engine: {e}")
    raise

# 4. Create SessionLocal and Base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 5. Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
