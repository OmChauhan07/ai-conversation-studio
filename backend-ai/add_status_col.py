import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL")
    sys.exit(1)
    
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
try:
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT \'Active\';'))
        conn.commit()
        print("Successfully added status column.")
except Exception as e:
    print(f"Error: {e}")
