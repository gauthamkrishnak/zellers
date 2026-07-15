import os
import shutil
from sqlalchemy import text
from database import engine

# 1. Duplicate image files in backend/uploads and client/src/assets so both spaced and unspaced versions exist
dirs_to_check = [
    os.path.join(os.path.dirname(__file__), "uploads"),
    os.path.join(os.path.dirname(__file__), "../client/src/assets"),
]

pairs = [
    ("iphone13.jpg", "iphone 13.jpg"),
    ("atomichabits.jpg", "atomic habits.jpg"),
    ("badmintonracket.jpg", "badminton racket.jpg"),
]

for directory in dirs_to_check:
    if not os.path.exists(directory):
        continue
    for clean_name, spaced_name in pairs:
        clean_path = os.path.join(directory, clean_name)
        spaced_path = os.path.join(directory, spaced_name)
        if os.path.exists(clean_path) and not os.path.exists(spaced_path):
            shutil.copy2(clean_path, spaced_path)
            print(f"Copied {clean_name} -> {spaced_name} in {directory}")
        elif os.path.exists(spaced_path) and not os.path.exists(clean_path):
            shutil.copy2(spaced_path, clean_path)
            print(f"Copied {spaced_name} -> {clean_name} in {directory}")

# 2. Update existing PostgreSQL records
with engine.connect() as conn:
    try:
        conn.execute(text("UPDATE products SET image = 'iphone13.jpg' WHERE image = 'iphone 13.jpg' OR title ILIKE '%iphone 13%'"))
        conn.execute(text("UPDATE products SET image = 'atomichabits.jpg' WHERE image = 'atomic habits.jpg' OR title ILIKE '%atomic habits%'"))
        conn.execute(text("UPDATE products SET image = 'badmintonracket.jpg' WHERE image = 'badminton racket.jpg' OR title ILIKE '%badminton racket%'"))
        conn.commit()
        print("Database products table updated successfully!")
    except Exception as e:
        print("Error updating database:", e)
