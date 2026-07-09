"""
Migration script to:
1. Drop the 'is_wishlisted' column from the 'products' table
2. Create 'wishlists' and 'carts' tables

Run this ONCE: python migrate.py
"""
from database import engine, SessionLocal
from sqlalchemy import text
from models import Base

def migrate():
    # Create new tables (wishlists, carts) if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Drop is_wishlisted column from products (if it exists)
    try:
        db.execute(text(
            "ALTER TABLE products DROP COLUMN IF EXISTS is_wishlisted"
        ))
        db.commit()
        print("[OK] Dropped 'is_wishlisted' column from products table")
    except Exception as e:
        db.rollback()
        print(f"[WARN] Could not drop is_wishlisted column: {e}")

    db.close()
    print("[OK] Migration complete! New tables created: wishlists, carts")

if __name__ == "__main__":
    migrate()
