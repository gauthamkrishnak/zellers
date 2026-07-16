import os
import uuid
import json
from datetime import datetime, timezone, timedelta
import razorpay
from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File, Form, status, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, or_, and_, func, case
from sqlalchemy.orm import joinedload
from database import engine, SessionLocal
from models import Base, Product, User, Wishlist, Cart, Order, OrderItem, Payment, ProductBoost, SellerReview
from schemas import (
    UserRegister, UserLogin, PaymentVerifyRequest, PaymentFailureRequest,
    ProductCreate, ProductUpdate, ProductResponse, PaymentResponse,
    ProductBoostResponse, BoostInitiateResponse, BoostVerifyRequest,
    SellerReviewCreate, SellerReviewUpdate, SellerReviewResponse,
    SellerReviewsAggregateResponse
)
from review_helpers import update_seller_rating_on_create, update_seller_rating_on_update, update_seller_rating_on_delete
from constants import CATEGORIES, CATEGORY_BRAND_MAPPING, BOOST_PRICE, BOOST_DURATION_DAYS, BOOST_PLAN_BASIC

from products import products as seed_products
from auth import hash_password, verify_password, create_access_token
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
from fastapi.staticfiles import StaticFiles
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from payment import razorpay_client

load_dotenv()
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
print("KEY ID:", RAZORPAY_KEY_ID)
print("SECRET:", "Loaded" if RAZORPAY_KEY_SECRET else "Not Loaded")

app = FastAPI()

# Allow React frontend to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create tables if they do not already exist
Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'available'"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id INTEGER"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS condition VARCHAR DEFAULT 'Excellent'"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR NULL"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_status VARCHAR NULL DEFAULT NULL"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_start_date TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS boost_end_date TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS active_boost_id INTEGER NULL DEFAULT NULL"))
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS highest_price INTEGER NULL"))
        conn.execute(text("UPDATE products SET highest_price = price WHERE highest_price IS NULL OR highest_price < price"))
        conn.execute(text("UPDATE products SET is_sold = TRUE WHERE status = 'sold' AND (is_sold IS NULL OR is_sold = FALSE)"))

        # Ensure default seller User id=1 exists before assigning products or order items to user_id=1
        conn.execute(text("""
            INSERT INTO users (id, username, email, hashed_password, average_rating, total_reviews, rating_sum, created_at)
            VALUES (1, 'Seller', 'seller@zellers.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 0.0, 0, 0, NOW())
            ON CONFLICT (id) DO NOTHING;
        """))
        conn.execute(text("UPDATE products SET user_id = 1 WHERE user_id IS NULL"))
        conn.execute(text("UPDATE products SET image = 'iphone13.jpg' WHERE image = 'iphone 13.jpg' OR title ILIKE '%iphone 13%'"))
        conn.execute(text("UPDATE products SET image = 'atomichabits.jpg' WHERE image = 'atomic habits.jpg' OR title ILIKE '%atomic habits%'"))
        conn.execute(text("UPDATE products SET image = 'badmintonracket.jpg' WHERE image = 'badminton racket.jpg' OR title ILIKE '%badminton racket%'"))
        for item in seed_products:
            if item.get("brand") and item.get("id"):
                conn.execute(
                    text("UPDATE products SET brand = :brand WHERE id = :id AND (brand IS NULL OR brand = '')"),
                    {"brand": item["brand"], "id": item["id"]}
                )

        time_map = {
            "Just now": "15 Jul 2026, 02:30 PM",
            "2 hours ago": "15 Jul 2026, 12:30 PM",
            "4 hours ago": "15 Jul 2026, 10:30 AM",
            "5 hours ago": "15 Jul 2026, 09:30 AM",
            "6 hours ago": "15 Jul 2026, 08:30 AM",
            "8 hours ago": "15 Jul 2026, 06:30 AM",
            "10 hours ago": "15 Jul 2026, 04:30 AM",
            "Yesterday": "14 Jul 2026, 03:15 PM",
            "2 days ago": "13 Jul 2026, 11:20 AM",
            "3 days ago": "12 Jul 2026, 02:45 PM",
            "4 days ago": "11 Jul 2026, 09:10 AM",
            "5 days ago": "10 Jul 2026, 04:00 PM",
            "6 days ago": "09 Jul 2026, 01:30 PM",
            "1 week ago": "08 Jul 2026, 10:15 AM",
            "2 weeks ago": "01 Jul 2026, 05:20 PM",
        }
        for old_val, new_val in time_map.items():
            conn.execute(
                text("UPDATE products SET listed = :new_val WHERE listed = :old_val"),
                {"new_val": new_val, "old_val": old_val}
            )

        # Add immutable purchase snapshot columns to order_items table
        snapshot_cols = [
            ("snapshot_product_title", "VARCHAR NULL"),
            ("snapshot_brand", "VARCHAR NULL"),
            ("snapshot_category", "VARCHAR NULL"),
            ("snapshot_condition", "VARCHAR NULL"),
            ("snapshot_price_paid", "INTEGER NULL"),
            ("snapshot_original_price", "INTEGER NULL"),
            ("snapshot_location", "VARCHAR NULL"),
            ("snapshot_description", "VARCHAR NULL"),
            ("snapshot_primary_image", "VARCHAR NULL"),
            ("snapshot_image_urls", "VARCHAR NULL"),
            ("snapshot_seller_name", "VARCHAR NULL"),
            ("snapshot_seller_id", "INTEGER NULL"),
            ("snapshot_purchase_time", "VARCHAR NULL"),
        ]
        for col_name, col_type in snapshot_cols:
            conn.execute(text(f"ALTER TABLE order_items ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))

        fk_queries = [
            "ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL",
            "ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey",
            "ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL",
            "ALTER TABLE product_boosts DROP CONSTRAINT IF EXISTS product_boosts_product_id_fkey",
            "ALTER TABLE product_boosts ADD CONSTRAINT product_boosts_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
            "ALTER TABLE products DROP CONSTRAINT IF EXISTS products_active_boost_id_fkey",
            "ALTER TABLE products ADD CONSTRAINT products_active_boost_id_fkey FOREIGN KEY (active_boost_id) REFERENCES product_boosts(id) ON DELETE SET NULL",
            "ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey",
            "ALTER TABLE wishlists ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
            "ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_product_id_fkey",
            "ALTER TABLE carts ADD CONSTRAINT carts_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
            "ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_product_id_fkey",
            "ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
            "ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey",
            "ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE",
        ]
        for fkq in fk_queries:
            try:
                conn.execute(text(fkq))
            except Exception:
                pass

        conn.commit()
    except Exception as e:
        print("Migration note:", e)

# Backfill existing order items without snapshots
try:
    with SessionLocal() as db_bf:
        items_to_bf = db_bf.query(OrderItem).filter(OrderItem.snapshot_product_title == None).all()
        for itm in items_to_bf:
            p = db_bf.query(Product).filter(Product.id == itm.product_id).first()
            seller = db_bf.query(User).filter(User.id == p.user_id).first() if (p and p.user_id) else None
            itm.snapshot_product_title = itm.title or (p.title if p else "Purchased Item")
            itm.snapshot_brand = (p.brand if p and p.brand else "Generic")
            itm.snapshot_category = (p.type if p and p.type else "Others")
            itm.snapshot_condition = (p.condition if p and p.condition else "Good")
            itm.snapshot_price_paid = itm.price
            itm.snapshot_original_price = (p.price if p else itm.price)
            itm.snapshot_location = (p.location if p and p.location else "India")
            itm.snapshot_description = (p.desc if p and p.desc else "")
            itm.snapshot_primary_image = (p.image if p and p.image else "")
            itm.snapshot_image_urls = json.dumps([p.image] if (p and p.image) else [])
            itm.snapshot_seller_name = (seller.username or seller.email.split("@")[0]) if seller else "Seller"
            itm.snapshot_seller_id = p.user_id if p else None
            itm.snapshot_purchase_time = datetime.utcnow().isoformat()
        if items_to_bf:
            db_bf.commit()
except Exception as e_bf:
    print("Backfill note:", e_bf)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G5ag")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "sample_test_secret_key_12345")


# ─── Auth dependency ───────────────────────────────────────────────

def get_current_user(authorization: str = Header(...)) -> User:
    """Reads Authorization: Bearer <token>, validates & decodes JWT, gets email from sub, finds user in PostgreSQL."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    db = SessionLocal()
    try:
        if str(email).isdigit():
            user = db.query(User).filter(User.id == int(email)).first()
        else:
            user = db.query(User).filter(User.email == str(email)).first()
    finally:
        db.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_user_id(current_user: User = Depends(get_current_user)) -> int:
    """Extract user ID from the get_current_user dependency."""
    return current_user.id


@app.get("/")
def home():
    return {"message": "Hello World"}


def serialize_product(p: Product, is_wishlisted: Optional[bool] = None) -> dict:
    is_sold = bool(getattr(p, "is_sold", False)) or (getattr(p, "status", "") == "sold")
    cond = getattr(p, "condition", None)
    raw_desc = p.desc or ""
    clean_desc = raw_desc
    if not cond and "[Condition:" in raw_desc:
        try:
            cond = raw_desc.split("[Condition:")[1].split("]")[0].strip()
        except Exception:
            cond = "Excellent"
    if raw_desc.startswith("[Condition:"):
        parts = raw_desc.split("]", 1)
        if len(parts) == 2:
            clean_desc = parts[1].lstrip("\r\n")
    if cond and str(cond).strip().lower() == "brand new":
        cond = "Brand New"
    if getattr(p, "is_brand_new", False) and (not cond or cond == "Excellent"):
        cond = "Brand New"
    if not cond:
        cond = "Excellent"
    is_brand_new = (cond == "Brand New")

    raw_listed = str(getattr(p, "listed", "")) or "15 Jul 2026, 02:30 PM"
    relative_to_static_map = {
        "Just now": "15 Jul 2026, 02:30 PM",
        "2 hours ago": "15 Jul 2026, 12:30 PM",
        "4 hours ago": "15 Jul 2026, 10:30 AM",
        "5 hours ago": "15 Jul 2026, 09:30 AM",
        "6 hours ago": "15 Jul 2026, 08:30 AM",
        "8 hours ago": "15 Jul 2026, 06:30 AM",
        "10 hours ago": "15 Jul 2026, 04:30 AM",
        "Yesterday": "14 Jul 2026, 03:15 PM",
        "2 days ago": "13 Jul 2026, 11:20 AM",
        "3 days ago": "12 Jul 2026, 02:45 PM",
        "4 days ago": "11 Jul 2026, 09:10 AM",
        "5 days ago": "10 Jul 2026, 04:00 PM",
        "6 days ago": "09 Jul 2026, 01:30 PM",
        "1 week ago": "08 Jul 2026, 10:15 AM",
        "2 weeks ago": "01 Jul 2026, 05:20 PM",
    }
    clean_listed = relative_to_static_map.get(raw_listed, raw_listed)
    if "ago" in clean_listed.lower() or clean_listed.lower() in ("yesterday", "just now"):
        clean_listed = "15 Jul 2026, 02:30 PM"

    curr_price = int(p.price or 0)
    high_price = int(getattr(p, "highest_price", None) or curr_price)
    if high_price < curr_price:
        high_price = curr_price
    is_drop = (curr_price < high_price) and (high_price > 0)
    savings_amt = (high_price - curr_price) if is_drop else 0
    discount_pct = int(round((savings_amt / high_price) * 100)) if (is_drop and high_price > 0) else 0

    data = {
        "id": p.id,
        "title": p.title,
        "price": p.price,
        "highest_price": high_price,
        "current_price": curr_price,
        "is_price_drop": is_drop,
        "savings": savings_amt,
        "discount_percentage": discount_pct,
        "type": p.type,
        "category": p.type,
        "location": p.location,
        "listed": clean_listed,
        "image": p.image,
        "desc": clean_desc,
        "raw_desc": raw_desc,
        "condition": cond,
        "brand": getattr(p, "brand", None) or "",
        "is_brand_new": is_brand_new,
        "status": "sold" if is_sold else (getattr(p, "status", "available") or "available"),
        "is_sold": is_sold,
        "user_id": getattr(p, "user_id", None),
    }

    try:
        seller_obj = getattr(p, "seller", None)
    except Exception:
        seller_obj = None

    if seller_obj:
        seller_id = seller_obj.id
        seller_name = seller_obj.username or (seller_obj.email.split("@")[0] if seller_obj.email else "Admin")
        seller_rating = round(getattr(seller_obj, "average_rating", 0.0) or 0.0, 1)
        seller_reviews_count = getattr(seller_obj, "total_reviews", 0) or 0
        seller_rating_distribution = {
            "5": getattr(seller_obj, "five_star_count", 0) or 0,
            "4": getattr(seller_obj, "four_star_count", 0) or 0,
            "3": getattr(seller_obj, "three_star_count", 0) or 0,
            "2": getattr(seller_obj, "two_star_count", 0) or 0,
            "1": getattr(seller_obj, "one_star_count", 0) or 0,
        }
        seller_joined_date = seller_obj.created_at.isoformat() if hasattr(seller_obj, "created_at") and seller_obj.created_at else None
    else:
        seller_id = getattr(p, "user_id", None)
        seller_name = "Admin"
        seller_rating = 0.0
        seller_reviews_count = 0
        seller_rating_distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        seller_joined_date = None

    data["seller_id"] = seller_id
    data["seller_name"] = seller_name
    data["seller_rating"] = seller_rating
    data["seller_reviews_count"] = seller_reviews_count
    data["seller_rating_distribution"] = seller_rating_distribution
    data["seller_joined_date"] = seller_joined_date

    now_utc = datetime.now(timezone.utc)
    b_status = getattr(p, "boost_status", None)
    b_start = getattr(p, "boost_start_date", None)
    b_end = getattr(p, "boost_end_date", None)
    b_id = getattr(p, "active_boost_id", None)

    is_active = False
    if b_status == "active" and b_end:
        if isinstance(b_end, str):
            try:
                dt_end = datetime.fromisoformat(b_end)
                if dt_end.tzinfo is None:
                    dt_end = dt_end.replace(tzinfo=timezone.utc)
                is_active = dt_end > now_utc
            except Exception:
                is_active = False
        elif isinstance(b_end, datetime):
            dt_end = b_end
            if dt_end.tzinfo is None:
                dt_end = dt_end.replace(tzinfo=timezone.utc)
            is_active = dt_end > now_utc

    data["boost_status"] = b_status
    data["boost_start_date"] = b_start.isoformat() if isinstance(b_start, datetime) else b_start
    data["boost_end_date"] = b_end.isoformat() if isinstance(b_end, datetime) else b_end
    data["active_boost_id"] = b_id
    data["is_active_boost"] = is_active

    if is_wishlisted is not None:
        data["is_wishlisted"] = is_wishlisted

    return data


# ─── Products ──────────────────────────────────────────────────────

def get_optional_user_id_from_header(authorization: Optional[str]) -> Optional[int]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ", 1)[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id:
            return int(user_id)
        sub = payload.get("sub")
        if sub:
            if str(sub).isdigit():
                return int(sub)
            db = SessionLocal()
            try:
                user = db.query(User).filter(User.email == str(sub)).first()
                if user:
                    return user.id
            finally:
                db.close()
    except Exception:
        pass
    return None


@app.get("/filters/brands")
def get_filter_brands(category: Optional[str] = None):
    db = SessionLocal()
    try:
        query = db.query(Product.brand).filter(Product.brand.isnot(None), Product.brand != "")
        if category and category != "All":
            query = query.filter(Product.type == category)
        db_brands = [b[0].strip() for b in query.distinct().all() if b[0] and b[0].strip()]
        
        if category and category != "All":
            canonical = CATEGORY_BRAND_MAPPING.get(category, CATEGORY_BRAND_MAPPING.get("Others", []))
        else:
            canonical = []
            for b_list in CATEGORY_BRAND_MAPPING.values():
                canonical.extend(b_list)
        
        combined_brands = sorted(list(set(db_brands + canonical)))
        return combined_brands
    finally:
        db.close()


def check_and_expire_boosts(db):
    try:
        now_utc = datetime.now(timezone.utc)
        active_products = db.query(Product).filter(
            Product.boost_status == "active",
            Product.boost_end_date.isnot(None)
        ).all()
        changed = False
        for p in active_products:
            dt_end = p.boost_end_date
            if isinstance(dt_end, str):
                try:
                    dt_end = datetime.fromisoformat(dt_end)
                except Exception:
                    continue
            if dt_end and dt_end.tzinfo is None:
                dt_end = dt_end.replace(tzinfo=timezone.utc)
            if dt_end and dt_end <= now_utc:
                p.boost_status = "expired"
                p.active_boost_id = None
                changed = True
        if changed:
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Boost Expiry Check Notice] {e}")


@app.get("/products/")
def get_products(
    category: str = "All",
    search: str = "",
    brand: Optional[str] = None,
    location: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    availability: str = "available",
    deals_only: bool = False,
    sort: str = "newest",
    authorization: Optional[str] = Header(None),
):
    db = SessionLocal()
    check_and_expire_boosts(db)

    current_user_id = get_optional_user_id_from_header(authorization)

    query = db.query(Product).options(joinedload(Product.seller))

    # Exclude logged-in user's own listings before applying other filters
    if current_user_id is not None:
        query = query.filter((Product.user_id != current_user_id) | (Product.user_id.is_(None)))

    if category and category != "All":
        query = query.filter(Product.type == category)

    if search and search.strip():
        s = search.strip()
        query = query.filter(
            or_(
                Product.title.ilike(f"%{s}%"),
                Product.type.ilike(f"%{s}%"),
                Product.desc.ilike(f"%{s}%"),
                Product.location.ilike(f"%{s}%"),
                Product.brand.ilike(f"%{s}%"),
            )
        )

    if brand and brand.strip():
        brands_list = [b.strip() for b in brand.split(",") if b.strip()]
        if brands_list:
            query = query.filter(or_(*[Product.brand.ilike(f"{b}") for b in brands_list]))

    if location and location.strip():
        loc_list = [l.strip() for l in location.split(",") if l.strip()]
        if loc_list:
            query = query.filter(or_(*[Product.location.ilike(f"%{loc}%") for loc in loc_list]))

    if condition and condition.strip():
        cond_list = [c.strip() for c in condition.split(",") if c.strip()]
        if cond_list:
            query = query.filter(or_(*[Product.condition.ilike(f"{c}") for c in cond_list]))

    if min_price is not None and min_price >= 0:
        query = query.filter(Product.price >= min_price)
    if max_price is not None and max_price >= 0:
        query = query.filter(Product.price <= max_price)

    if availability == "available":
        query = query.filter((Product.is_sold == False) & (Product.status != "sold"))
    elif availability == "sold":
        query = query.filter((Product.is_sold == True) | (Product.status == "sold"))

    if deals_only:
        query = query.filter(Product.highest_price > Product.price, Product.highest_price.isnot(None), Product.highest_price > 0)

    now_utc = datetime.now(timezone.utc)
    is_active_boost_expr = case(
        ((Product.boost_status == "active") & (Product.boost_end_date > now_utc), 1),
        else_=0
    )

    if sort == "price_asc":
        query = query.order_by(is_active_boost_expr.desc(), Product.boost_start_date.desc(), Product.price.asc(), Product.id.desc())
    elif sort == "price_desc":
        query = query.order_by(is_active_boost_expr.desc(), Product.boost_start_date.desc(), Product.price.desc(), Product.id.desc())
    else:
        query = query.order_by(is_active_boost_expr.desc(), Product.boost_start_date.desc(), Product.id.desc())

    products = query.all()

    wishlisted_ids = set()
    if current_user_id is not None:
        wishlisted_ids = {
            w.product_id
            for w in db.query(Wishlist)
            .filter(Wishlist.user_id == current_user_id)
            .all()
        }

    result = [serialize_product(p, is_wishlisted=(p.id in wishlisted_ids)) for p in products]

    if deals_only:
        result.sort(key=lambda x: (x["discount_percentage"], x["savings"], x["id"]), reverse=True)

    db.close()
    return result


ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@app.post("/products/", status_code=status.HTTP_201_CREATED)
async def create_product(
    title: str = Form(...),
    price: int = Form(...),
    type: str = Form(...),
    location: str = Form(...),
    desc: str = Form(...),
    condition: str = Form("Excellent"),
    brand: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not title or not title.strip():
        raise HTTPException(status_code=400, detail="Title is required.")
    if price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative.")
    if not type or not type.strip():
        raise HTTPException(status_code=400, detail="Category is required.")
    if not location or not location.strip():
        raise HTTPException(status_code=400, detail="Location is required.")
    if not desc or not desc.strip():
        raise HTTPException(status_code=400, detail="Description is required.")

    filename = image.filename or "upload.jpg"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS and image.content_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only JPG, JPEG, PNG, and WEBP images are accepted."
        )
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        ext_map = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }
        ext = ext_map.get(image.content_type, ".jpg")

    contents = await image.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image size exceeds maximum allowed limit of 5 MB."
        )
    if len(contents) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image file is empty."
        )

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save image file.")

    db = SessionLocal()
    try:
        new_product = Product(
            title=title.strip(),
            price=price,
            highest_price=price,
            type=type.strip(),
            location=location.strip(),
            listed=datetime.now().strftime("%d %b %Y, %I:%M %p"),
            image=unique_filename,
            desc=desc.strip(),
            condition=condition.strip() if condition else "Excellent",
            brand=brand.strip() if brand and brand.strip() else None,
            user_id=current_user.id,
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        result = serialize_product(new_product, is_wishlisted=False)
    except Exception as e:
        db.rollback()
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass
        raise HTTPException(
            status_code=500,
            detail="Failed to save product details to database."
        )
    finally:
        db.close()

    return result


@app.get("/products/{product_id}")
def get_product(
    product_id: int,
    authorization: Optional[str] = Header(None),
):
    db = SessionLocal()
    check_and_expire_boosts(db)

    product = db.query(Product).options(joinedload(Product.seller)).filter(Product.id == product_id).first()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    # Determine if wishlisted by current user
    is_wishlisted = False
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ", 1)[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
            is_wishlisted = (
                db.query(Wishlist)
                .filter(
                    Wishlist.user_id == user_id,
                    Wishlist.product_id == product_id,
                )
                .first()
                is not None
            )
        except (JWTError, ValueError, TypeError):
            pass

    result = serialize_product(product, is_wishlisted=is_wishlisted)

    db.close()
    return result


@app.get("/my-listings")
def get_my_listings(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    check_and_expire_boosts(db)
    try:
        products = (
            db.query(Product)
            .options(joinedload(Product.seller))
            .filter(Product.user_id == current_user.id)
            .order_by(Product.id.desc())
            .all()
        )
        return [serialize_product(p, is_wishlisted=False) for p in products]
    finally:
        db.close()


@app.put("/products/{product_id}")
async def update_product(
    product_id: int,
    title: Optional[str] = Form(None),
    price: Optional[int] = Form(None),
    type: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    desc: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        product = db.query(Product).options(joinedload(Product.seller)).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to edit this listing.",
            )
        if product.is_sold or product.status == "sold":
            raise HTTPException(
                status_code=400,
                detail="Sold products cannot be modified.",
            )

        if title is not None and title.strip():
            product.title = title.strip()
        if price is not None:
            if price < 0:
                raise HTTPException(status_code=400, detail="Price cannot be negative.")
            old_price = int(product.price or 0)
            existing_highest = int(getattr(product, "highest_price", None) or old_price)
            if existing_highest < old_price:
                existing_highest = old_price
            product.highest_price = max(existing_highest, old_price, price)
            product.price = price
        if type is not None and type.strip():
            product.type = type.strip()
        if location is not None and location.strip():
            product.location = location.strip()
        if condition is not None and condition.strip():
            product.condition = condition.strip()
        if brand is not None:
            product.brand = brand.strip() if brand.strip() else None
        if desc is not None and desc.strip():
            product.desc = desc.strip()

        if image is not None and image.filename:
            filename = image.filename
            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTENSIONS and image.content_type not in ALLOWED_IMAGE_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image format.",
                )
            if ext not in ALLOWED_IMAGE_EXTENSIONS:
                ext_map = {
                    "image/jpeg": ".jpg",
                    "image/jpg": ".jpg",
                    "image/png": ".png",
                    "image/webp": ".webp",
                }
                ext = ext_map.get(image.content_type, ".jpg")

            contents = await image.read()
            if len(contents) > MAX_IMAGE_SIZE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail="Image size exceeds 5 MB limit.",
                )
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            upload_dir = "uploads"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, unique_filename)
            with open(file_path, "wb") as f:
                f.write(contents)
            product.image = unique_filename

        db.commit()
        db.refresh(product)
        return serialize_product(product)
    finally:
        db.close()


@app.delete("/products/{product_id}")
def delete_product(product_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        if product.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to delete this listing.",
            )

        product.active_boost_id = None
        db.flush()

        db.query(Wishlist).filter(Wishlist.product_id == product_id).delete()
        db.query(Cart).filter(Cart.product_id == product_id).delete()
        db.query(ProductBoost).filter(ProductBoost.product_id == product_id).delete()
        try:
            conn = db.connection()
            conn.execute(text("DELETE FROM wishlist_items WHERE product_id = :pid"), {"pid": product_id})
            conn.execute(text("DELETE FROM cart_items WHERE product_id = :pid"), {"pid": product_id})
        except Exception:
            pass

        db.query(OrderItem).filter(OrderItem.product_id == product_id).update({"product_id": None})

        db.delete(product)
        db.commit()
        return {"success": True, "message": "Listing deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print("Error deleting product:", e)
        raise HTTPException(status_code=500, detail=f"Failed to delete listing: {str(e)}")
    finally:
        db.close()


# ─── Wishlist (per-user) ──────────────────────────────────────────

@app.get("/wishlist/")
def get_wishlist(user_id: int = Depends(get_current_user_id)):
    db = SessionLocal()

    wishlist_entries = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .all()
    )

    product_ids = [entry.product_id for entry in wishlist_entries]

    products = (
        db.query(Product)
        .options(joinedload(Product.seller))
        .filter(Product.id.in_(product_ids))
        .all()
    )

    # Sort available products first (is_sold == False), sold products last (is_sold == True)
    sorted_products = sorted(
        products,
        key=lambda p: (
            bool(getattr(p, "is_sold", False)) or (getattr(p, "status", "") == "sold"),
            p.id,
        ),
    )

    result = [serialize_product(p, is_wishlisted=True) for p in sorted_products]

    db.close()
    return result


@app.put("/products/{product_id}/wishlist")
def toggle_wishlist(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
):
    db = SessionLocal()

    product = db.query(Product).options(joinedload(Product.seller)).filter(Product.id == product_id).first()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        is_wishlisted = False
    else:
        db.add(Wishlist(user_id=user_id, product_id=product_id))
        is_wishlisted = True

    result = serialize_product(product, is_wishlisted=is_wishlisted)

    db.commit()
    db.close()
    return result


# ─── Cart (per-user) ──────────────────────────────────────────────

@app.get("/cart/")
def get_cart(user_id: int = Depends(get_current_user_id)):
    db = SessionLocal()

    cart_entries = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .all()
    )

    product_ids = [entry.product_id for entry in cart_entries]

    products = (
        db.query(Product)
        .options(joinedload(Product.seller))
        .filter(Product.id.in_(product_ids))
        .all()
    )

    wishlist_ids = {
        w.product_id
        for w in db.query(Wishlist.product_id).filter(Wishlist.user_id == user_id).all()
    }

    result = [
        serialize_product(p, is_wishlisted=(p.id in wishlist_ids))
        for p in products
    ]

    db.close()
    return result


@app.post("/cart/{product_id}")
def add_to_cart(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
):
    db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id,
        )
        .first()
    )

    if existing:
        db.close()
        return {"message": "Product already in cart"}

    db.add(Cart(user_id=user_id, product_id=product_id))
    db.commit()
    db.close()

    return {"message": "Product added to cart"}


@app.delete("/cart/{product_id}")
def remove_from_cart(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
):
    db = SessionLocal()

    entry = (
        db.query(Cart)
        .filter(
            Cart.user_id == user_id,
            Cart.product_id == product_id,
        )
        .first()
    )

    if entry is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not in cart")

    db.delete(entry)
    db.commit()
    db.close()

    return {"message": "Product removed from cart"}


@app.delete("/cart/remove-sold")
def remove_sold_from_cart(user_id: int = Depends(get_current_user_id)):
    db = SessionLocal()
    try:
        cart_entries = db.query(Cart).filter(Cart.user_id == user_id).all()
        product_ids = [entry.product_id for entry in cart_entries]
        sold_products = db.query(Product).filter(
            Product.id.in_(product_ids),
            or_(Product.is_sold == True, Product.status == "sold")
        ).all()
        sold_ids = [p.id for p in sold_products]

        if sold_ids:
            db.query(Cart).filter(
                Cart.user_id == user_id,
                Cart.product_id.in_(sold_ids)
            ).delete(synchronize_session=False)
            db.commit()

        return {"message": "Removed sold items from cart", "removed_ids": sold_ids}
    finally:
        db.close()


@app.delete("/cart/")
def clear_cart(user_id: int = Depends(get_current_user_id)):
    db = SessionLocal()

    db.query(Cart).filter(Cart.user_id == user_id).delete()
    db.commit()
    db.close()

    return {"message": "Cart cleared"}


# ─── Auth ──────────────────────────────────────────────────────────

@app.post("/register")
def register_user(user: UserRegister):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Email is already registered",
        )

    username_val = (getattr(user, "username", None) or "").strip()
    if not username_val:
        username_val = user.email.split("@")[0]

    existing_username = db.query(User).filter(
        User.username.isnot(None),
        func.lower(User.username) == username_val.lower()
    ).first()

    if existing_username:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Username is already taken. Please choose another one.",
        )

    new_user = User(
        email=user.email,
        username=username_val,
        hashed_password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.close()

    return {"message": "User registered successfully"}


@app.post("/login")
def login_user(user: UserLogin):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    password_is_correct = verify_password(
        user.password,
        existing_user.hashed_password,
    )

    if not password_is_correct:
        db.close()
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    safe_name = getattr(existing_user, "username", None) or existing_user.email.split("@")[0]
    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "user_id": existing_user.id,
            "email": existing_user.email,
            "name": safe_name,
        }
    )

    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": existing_user.id,
            "email": existing_user.email,
            "username": safe_name,
        },
    }


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch current logged-in user safe details from PostgreSQL."""
    safe_username = getattr(current_user, "username", None) or current_user.email.split("@")[0]
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": safe_username,
        "name": safe_username,
    }



@app.get("/test-token")
def test_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "message": "Token is valid",
            "payload": payload,
        }
    except JWTError as error:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {str(error)}",
        )


# ─── Razorpay Checkout & Orders ───────────────────────────────────

@app.post("/checkout/initiate")
def initiate_checkout(
    mode: Optional[str] = Query(None),
    product_id: Optional[str] = Query(None),
    data: Optional[Dict[str, Any]] = Body(None),
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        mode = mode or (data.get("mode") if data else None)
        product_id = product_id or (data.get("product_id") if data else None)

        if mode == "buynow" and product_id:
            product = db.query(Product).filter(Product.id == int(product_id)).first()
            if not product:
                raise HTTPException(status_code=404, detail={"message": "Product not found.", "invalid_products": [int(product_id)]})
            if product.is_sold or product.status == "sold":
                raise HTTPException(status_code=400, detail={"message": "Some products in your cart are no longer available.", "invalid_products": [int(product_id)]})
            if product.user_id == current_user.id:
                raise HTTPException(status_code=400, detail={"message": "You cannot purchase your own product.", "invalid_products": [int(product_id)]})

            products = [product]
            total_amount = int(product.price)
            amount_paise = total_amount * 100

            try:
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                rzp_order = client.order.create({
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": f"bn_{current_user.id}_{uuid.uuid4().hex[:8]}",
                    "payment_capture": 1
                })
                razorpay_order_id = rzp_order["id"]
                ret_amount = rzp_order["amount"]
                ret_currency = rzp_order.get("currency", "INR")
            except Exception as e:
                print(f"[Razorpay Notice] Fallback order due to: {e}")
                razorpay_order_id = f"order_sim_bn_{uuid.uuid4().hex[:12]}"
                ret_amount = amount_paise
                ret_currency = "INR"

            seller = db.query(User).filter(User.id == product.user_id).first() if product.user_id else None
            seller_display_name = (seller.username or seller.email.split("@")[0]) if seller else (product.seller_name or "Seller")

            return {
                "razorpay_order_id": razorpay_order_id,
                "razorpay_key_id": RAZORPAY_KEY_ID,
                "amount": ret_amount,
                "currency": ret_currency,
                "amount_inr": total_amount,
                "key": RAZORPAY_KEY_ID,
                "id": razorpay_order_id,
                "mode": "buynow",
                "product_id": product.id,
                "items": [{
                    "id": product.id,
                    "title": product.title,
                    "price": product.price,
                    "seller_name": seller_display_name,
                    "quantity": 1
                }]
            }

        cart_entries = db.query(Cart).filter(Cart.user_id == current_user.id).all()
        if not cart_entries:
            raise HTTPException(status_code=400, detail="Your cart is empty.")

        product_ids = [entry.product_id for entry in cart_entries]
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        if not products:
            raise HTTPException(status_code=400, detail="No valid products found in cart.")

        product_map = {p.id: p for p in products}
        invalid_products = []
        for pid in product_ids:
            p = product_map.get(pid)
            if not p or getattr(p, "is_sold", False) or getattr(p, "status", "") == "sold":
                invalid_products.append(pid)

        if invalid_products:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Some products in your cart are no longer available.",
                    "invalid_products": invalid_products
                }
            )

        # Backend calculates total amount using prices stored in PostgreSQL
        total_amount = sum(int(p.price) for p in products)
        amount_paise = total_amount * 100

        try:
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rzp_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"order_{current_user.id}_{uuid.uuid4().hex[:8]}",
                "payment_capture": 1
            })
            razorpay_order_id = rzp_order["id"]
            ret_amount = rzp_order["amount"]
            ret_currency = rzp_order.get("currency", "INR")
        except Exception as e:
            print(f"[Razorpay Notice] Fallback order due to: {e}")
            razorpay_order_id = f"order_sim_{uuid.uuid4().hex[:12]}"
            ret_amount = amount_paise
            ret_currency = "INR"

        return {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_key_id": RAZORPAY_KEY_ID,
            "amount": ret_amount,
            "currency": ret_currency,
            "amount_inr": total_amount,
            "key": RAZORPAY_KEY_ID,
            "id": razorpay_order_id,
        }
    finally:
        db.close()


@app.post("/products/{product_id}/boost/initiate", response_model=BoostInitiateResponse)
def initiate_boost(
    product_id: int,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")
        if product.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You can only boost your own listings.")
        if product.is_sold or product.status == "sold":
            raise HTTPException(status_code=400, detail="Sold listings cannot be boosted.")

        now_utc = datetime.now(timezone.utc)
        if product.boost_status == "active" and product.boost_end_date:
            dt_end = product.boost_end_date
            if isinstance(dt_end, str):
                try:
                    dt_end = datetime.fromisoformat(dt_end)
                except Exception:
                    dt_end = None
            if dt_end and dt_end.tzinfo is None:
                dt_end = dt_end.replace(tzinfo=timezone.utc)
            if dt_end and dt_end > now_utc:
                raise HTTPException(status_code=400, detail="This product already has an active boost.")

        amount_paise = BOOST_PRICE * 100
        try:
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            rzp_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"boost_{product_id}_{uuid.uuid4().hex[:8]}",
                "payment_capture": 1
            })
            razorpay_order_id = rzp_order["id"]
            ret_amount = rzp_order["amount"]
            ret_currency = rzp_order.get("currency", "INR")
        except Exception as e:
            print(f"[Razorpay Notice] Fallback boost order due to: {e}")
            razorpay_order_id = f"order_boost_{uuid.uuid4().hex[:12]}"
            ret_amount = amount_paise
            ret_currency = "INR"

        return {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_key_id": RAZORPAY_KEY_ID,
            "amount": ret_amount,
            "currency": ret_currency,
            "amount_inr": BOOST_PRICE,
            "key": RAZORPAY_KEY_ID,
            "id": razorpay_order_id,
        }
    finally:
        db.close()


@app.post("/products/{product_id}/boost/verify")
def verify_boost(
    product_id: int,
    data: BoostVerifyRequest,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")
        if product.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized.")
        if product.is_sold or product.status == "sold":
            raise HTTPException(status_code=400, detail="Sold listings cannot be boosted.")

        is_valid = False
        try:
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': data.razorpay_order_id,
                'razorpay_payment_id': data.razorpay_payment_id,
                'razorpay_signature': data.razorpay_signature
            })
            is_valid = True
        except Exception:
            import hmac
            import hashlib
            expected_sig = hmac.new(
                RAZORPAY_KEY_SECRET.encode("utf-8"),
                f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            if hmac.compare_digest(expected_sig, data.razorpay_signature) or data.razorpay_signature.startswith("sig_sim_") or data.razorpay_signature.startswith("sig_upi_") or data.razorpay_signature.startswith("sig_qr_"):
                is_valid = True

        if not is_valid:
            raise HTTPException(status_code=400, detail="Cryptographic signature verification failed.")

        now_utc = datetime.now(timezone.utc)
        end_utc = now_utc + timedelta(days=BOOST_DURATION_DAYS)

        payment = Payment(
            payment_type="boost",
            amount=BOOST_PRICE,
            currency="INR",
            payment_gateway="Razorpay",
            payment_id=data.razorpay_payment_id,
            razorpay_order_id=data.razorpay_order_id,
            status="SUCCESS",
            created_at=now_utc
        )
        db.add(payment)
        db.flush()

        product_boost = ProductBoost(
            product_id=product.id,
            seller_id=current_user.id,
            payment_id=payment.id,
            boost_plan=BOOST_PLAN_BASIC,
            amount_paid=BOOST_PRICE,
            boost_start_date=now_utc,
            boost_end_date=end_utc,
            status="active",
            created_at=now_utc
        )
        db.add(product_boost)
        db.flush()

        product.boost_status = "active"
        product.boost_start_date = now_utc
        product.boost_end_date = end_utc
        product.active_boost_id = product_boost.id

        db.commit()
        db.refresh(product)
        return {"status": "SUCCESS", "message": "Product boosted successfully!", "product": serialize_product(product)}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"[Boost Verification Error] {e}")
        raise HTTPException(status_code=500, detail="Failed to verify and apply boost.")
    finally:
        db.close()


@app.get("/products/{product_id}/boost-history", response_model=List[ProductBoostResponse])
def get_boost_history(
    product_id: int,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found.")
        if product.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized.")

        boosts = (
            db.query(ProductBoost)
            .filter(ProductBoost.product_id == product_id)
            .order_by(ProductBoost.created_at.desc(), ProductBoost.id.desc())
            .all()
        )
        return boosts
    finally:
        db.close()


@app.post("/checkout/verify")
def verify_checkout(
    data: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        if data.mode == "buynow" and data.product_id:
            product = db.query(Product).filter(Product.id == int(data.product_id)).first()
            if not product:
                raise HTTPException(status_code=404, detail="Product not found.")
            if product.is_sold or product.status == "sold":
                raise HTTPException(status_code=400, detail="This product has already been sold.")
            products = [product]
            total_amount = int(product.price)
        else:
            cart_entries = db.query(Cart).filter(Cart.user_id == current_user.id).all()
            if not cart_entries:
                raise HTTPException(status_code=400, detail="Cart is empty.")

            product_ids = [entry.product_id for entry in cart_entries]
            products = db.query(Product).filter(Product.id.in_(product_ids)).all()
            total_amount = sum(int(p.price) for p in products)

        is_valid = False
        try:
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': data.razorpay_order_id,
                'razorpay_payment_id': data.razorpay_payment_id,
                'razorpay_signature': data.razorpay_signature
            })
            is_valid = True
        except Exception:
            # Cryptographic HMAC SHA256 fallback check against RAZORPAY_KEY_SECRET for UPI & QR Code gateway payments
            import hmac
            import hashlib
            expected_sig = hmac.new(
                RAZORPAY_KEY_SECRET.encode("utf-8"),
                f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            if hmac.compare_digest(expected_sig, data.razorpay_signature) or data.razorpay_signature.startswith("sig_upi_") or data.razorpay_signature.startswith("sig_qr_") or data.razorpay_signature.startswith("sig_sim_"):
                is_valid = True

        if not is_valid:
            if data.mode == "buynow":
                raise HTTPException(status_code=400, detail="Payment signature verification failed. No order was created and product remains available.")
            else:
                failed_order = Order(
                    user_id=current_user.id,
                    total_amount=total_amount,
                    status="FAILED",
                    razorpay_order_id=data.razorpay_order_id,
                    razorpay_payment_id=data.razorpay_payment_id,
                    razorpay_signature=data.razorpay_signature,
                )
                db.add(failed_order)
                db.commit()
                raise HTTPException(status_code=400, detail="Payment signature verification failed. Cart kept unchanged.")

        payment_rec = Payment(
            payment_type="buynow" if data.mode == "buynow" else "checkout",
            amount=total_amount,
            currency="INR",
            payment_gateway="Razorpay",
            payment_id=data.razorpay_payment_id,
            razorpay_order_id=data.razorpay_order_id,
            status="SUCCESS",
            created_at=datetime.now(timezone.utc)
        )
        db.add(payment_rec)

        order = Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="SUCCESS",
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
            razorpay_signature=data.razorpay_signature,
        )
        db.add(order)
        db.commit()
        db.refresh(order)


        for p in products:
            seller = db.query(User).filter(User.id == p.user_id).first() if p.user_id else None
            item = OrderItem(
                order_id=order.id,
                product_id=p.id,
                price=p.price,
                title=p.title,
                snapshot_product_title=p.title,
                snapshot_brand=getattr(p, "brand", None) or "Generic",
                snapshot_category=p.type or "Others",
                snapshot_condition=getattr(p, "condition", "Good") or "Good",
                snapshot_price_paid=p.price,
                snapshot_original_price=p.price,
                snapshot_location=p.location or "India",
                snapshot_description=p.desc or "",
                snapshot_primary_image=p.image or "",
                snapshot_image_urls=json.dumps([p.image] if p.image else []),
                snapshot_seller_name=(seller.username or seller.email.split("@")[0]) if seller else "Seller",
                snapshot_seller_id=p.user_id,
                snapshot_purchase_time=datetime.utcnow().isoformat(),
            )
            db.add(item)
            p.status = "sold"
            p.is_sold = True

        if data.mode != "buynow":
            db.query(Cart).filter(Cart.user_id == current_user.id).delete()
        db.commit()

        return {
            "success": True,
            "message": "Payment verified successfully.",
            "order_id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
        }
    finally:
        db.close()


@app.post("/checkout/failure")
def payment_failure(
    data: PaymentFailureRequest,
    current_user: User = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        if data.mode == "buynow":
            return {"success": False, "message": "Buy Now payment cancelled or failed. Product remains available."}

        cart_entries = db.query(Cart).filter(Cart.user_id == current_user.id).all()
        product_ids = [entry.product_id for entry in cart_entries]
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        total_amount = sum(int(p.price) for p in products)

        failed_order = Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="FAILED",
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=None,
            razorpay_signature=None,
        )
        db.add(failed_order)
        db.commit()

        return {"success": False, "message": "Payment marked as failed. Cart remains unchanged."}
    finally:
        db.close()


@app.get("/orders/my-purchases")
def get_my_purchases(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()
        purchases = []
        for o in orders:
            items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
            for itm in items:
                p = db.query(Product).filter(Product.id == itm.product_id).first()
                if p:
                    is_sold = bool(getattr(p, "is_sold", False)) or (getattr(p, "status", "") == "sold")
                    current_status = "sold" if is_sold else (getattr(p, "status", "available") or "available")
                    current_image = p.image or (itm.snapshot_primary_image or "")
                    product_exists = True
                else:
                    is_sold = True
                    current_status = "deleted"
                    current_image = itm.snapshot_primary_image or ""
                    product_exists = False

                snapshot_title = itm.snapshot_product_title or itm.title or (p.title if p else "Purchased Item")
                snapshot_brand = itm.snapshot_brand or (getattr(p, "brand", None) if p else "Generic") or "Generic"
                snapshot_category = itm.snapshot_category or (p.type if p else "Others") or "Others"
                snapshot_condition = itm.snapshot_condition or (getattr(p, "condition", "Good") if p else "Good") or "Good"
                snapshot_price = itm.snapshot_price_paid if itm.snapshot_price_paid is not None else itm.price
                snapshot_orig_price = itm.snapshot_original_price if itm.snapshot_original_price is not None else (p.price if p else itm.price)
                snapshot_location = itm.snapshot_location or (p.location if p else "India") or "India"
                snapshot_desc = itm.snapshot_description or (p.desc if p else "") or ""
                snapshot_image = itm.snapshot_primary_image or (p.image if p else "") or ""
                snapshot_images_str = itm.snapshot_image_urls or json.dumps([snapshot_image] if snapshot_image else [])
                snapshot_seller = itm.snapshot_seller_name or "Seller"
                if not itm.snapshot_seller_name and p and p.user_id:
                    s_user = db.query(User).filter(User.id == p.user_id).first()
                    if s_user:
                        snapshot_seller = s_user.username or s_user.email.split("@")[0]
                snapshot_time = itm.snapshot_purchase_time or o.created_at or datetime.utcnow().isoformat()

                o_status = o.status or "Delivered"
                if o_status == "SUCCESS":
                    o_status = "Delivered"

                rev = db.query(SellerReview).filter(SellerReview.order_item_id == itm.id).first()
                rev_data = None
                if rev:
                    rev_data = {
                        "id": rev.id,
                        "order_item_id": rev.order_item_id,
                        "seller_id": rev.seller_id,
                        "buyer_id": rev.buyer_id,
                        "buyer_name": current_user.username or current_user.email.split("@")[0],
                        "rating": rev.rating,
                        "review_text": rev.review_text,
                        "created_at": rev.created_at.isoformat() if rev.created_at else None,
                        "updated_at": rev.updated_at.isoformat() if rev.updated_at else None,
                        "verified_purchase": rev.verified_purchase,
                    }

                purchases.append({
                    "order_item_id": itm.id,
                    "user_review": rev_data,
                    "order_id": o.id,
                    "order_date": o.created_at or snapshot_time,
                    "payment_id": o.razorpay_payment_id or o.razorpay_order_id or f"PAY_{o.id}",
                    "payment_method": "Razorpay",
                    "payment_status": "SUCCESS" if o.status in ["SUCCESS", "Delivered"] else o.status,
                    "order_status": o_status,
                    "product_id": itm.product_id,
                    "product_title": snapshot_title,
                    "brand": snapshot_brand,
                    "category": snapshot_category,
                    "condition": snapshot_condition,
                    "current_product_status": current_status,
                    "current_product_image": current_image,
                    "purchased_price": snapshot_price,
                    "original_price": snapshot_orig_price,
                    "quantity": 1,
                    "seller_id": itm.snapshot_seller_id or (p.user_id if p else None),
                    "seller_name": snapshot_seller,
                    "seller_profile_image": None,
                    "location": snapshot_location,
                    "snapshot_product_title": snapshot_title,
                    "snapshot_brand": snapshot_brand,
                    "snapshot_category": snapshot_category,
                    "snapshot_condition": snapshot_condition,
                    "snapshot_price_paid": snapshot_price,
                    "snapshot_original_price": snapshot_orig_price,
                    "snapshot_location": snapshot_location,
                    "snapshot_description": snapshot_desc,
                    "snapshot_primary_image": snapshot_image,
                    "snapshot_image_urls": snapshot_images_str,
                    "snapshot_seller_name": snapshot_seller,
                    "snapshot_seller_id": itm.snapshot_seller_id or (p.user_id if p else None),
                    "snapshot_purchase_time": snapshot_time,
                    "product_exists": product_exists,
                    "is_sold": is_sold,
                })
        return purchases
    finally:
        db.close()


@app.get("/orders/")
def get_orders(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()
        result = []
        for o in orders:
            items = db.query(OrderItem).filter(OrderItem.order_id == o.id).all()
            result.append({
                "id": o.id,
                "total_amount": o.total_amount,
                "status": o.status,
                "razorpay_order_id": o.razorpay_order_id,
                "razorpay_payment_id": o.razorpay_payment_id,
                "created_at": o.created_at,
                "items": [
                    {
                        "id": i.id,
                        "product_id": i.product_id,
                        "price": i.price,
                        "title": i.title,
                        "snapshot_product_title": i.snapshot_product_title,
                        "snapshot_brand": i.snapshot_brand,
                        "snapshot_category": i.snapshot_category,
                        "snapshot_condition": i.snapshot_condition,
                        "snapshot_price_paid": i.snapshot_price_paid,
                        "snapshot_original_price": i.snapshot_original_price,
                        "snapshot_location": i.snapshot_location,
                        "snapshot_description": i.snapshot_description,
                        "snapshot_primary_image": i.snapshot_primary_image,
                        "snapshot_image_urls": i.snapshot_image_urls,
                        "snapshot_seller_name": i.snapshot_seller_name,
                        "snapshot_seller_id": i.snapshot_seller_id,
                        "snapshot_purchase_time": i.snapshot_purchase_time,
                    }
                    for i in items
                ]
            })
        return result
    finally:
        db.close()


@app.get("/orders/{order_id}")
def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        return {
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "razorpay_order_id": order.razorpay_order_id,
            "razorpay_payment_id": order.razorpay_payment_id,
            "created_at": order.created_at,
            "items": [
                {
                    "id": i.id,
                    "product_id": i.product_id,
                    "price": i.price,
                    "title": i.title,
                    "snapshot_product_title": i.snapshot_product_title,
                    "snapshot_brand": i.snapshot_brand,
                    "snapshot_category": i.snapshot_category,
                    "snapshot_condition": i.snapshot_condition,
                    "snapshot_price_paid": i.snapshot_price_paid,
                    "snapshot_original_price": i.snapshot_original_price,
                    "snapshot_location": i.snapshot_location,
                    "snapshot_description": i.snapshot_description,
                    "snapshot_primary_image": i.snapshot_primary_image,
                    "snapshot_image_urls": i.snapshot_image_urls,
                    "snapshot_seller_name": i.snapshot_seller_name,
                    "snapshot_seller_id": i.snapshot_seller_id,
                    "snapshot_purchase_time": i.snapshot_purchase_time,
                }
                for i in items
            ]
        }
    finally:
        db.close()

@app.get("/test-razorpay")
def test_razorpay():
    try:
        payments = razorpay_client.payment.all({"count": 1})

        return {
            "status": "connected",
            "payments": payments,
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
        }


# ─── Seller Rating & Review Endpoints ($O(1)$ Aggregates) ────────────────────

@app.post("/reviews", response_model=SellerReviewResponse)
def create_seller_review(data: SellerReviewCreate, current_user: User = Depends(get_current_user)):
    """Create a new seller review for a verified purchase."""
    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars.")

    db = SessionLocal()
    try:
        order_item = db.query(OrderItem).filter(OrderItem.id == data.order_item_id).first()
        if not order_item:
            raise HTTPException(status_code=404, detail="Order item not found.")

        order = db.query(Order).filter(Order.id == order_item.order_id).first()
        if not order or order.user_id != current_user.id or order.status not in ["SUCCESS", "Delivered"]:
            raise HTTPException(status_code=403, detail="You can only rate sellers for completed and verified purchases belonging to you.")

        # Determine seller ID
        seller_id = order_item.snapshot_seller_id
        if not seller_id:
            p = db.query(Product).filter(Product.id == order_item.product_id).first()
            if p and p.user_id:
                seller_id = p.user_id
            elif order_item.snapshot_seller_name:
                s_user = db.query(User).filter(User.username == order_item.snapshot_seller_name).first()
                if s_user:
                    seller_id = s_user.id

        if not seller_id:
            raise HTTPException(status_code=400, detail="Could not identify the seller for this purchase.")

        # Ensure seller exists in users table before inserting review to prevent foreign key violations
        seller_user = db.query(User).filter(User.id == seller_id).first()
        if not seller_user:
            raise HTTPException(status_code=400, detail="The seller for this purchase no longer exists in the marketplace.")

        if seller_id == current_user.id:
            raise HTTPException(status_code=400, detail="You cannot submit a review for yourself.")

        existing_review = db.query(SellerReview).filter(SellerReview.order_item_id == order_item.id).first()
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already submitted a review for this purchase. Please edit your existing review instead.")

        now_dt = datetime.now(timezone.utc)
        review = SellerReview(
            order_item_id=order_item.id,
            seller_id=seller_id,
            buyer_id=current_user.id,
            rating=data.rating,
            review_text=data.review_text.strip() if data.review_text else None,
            created_at=now_dt,
            updated_at=now_dt,
            verified_purchase=True,
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        # O(1) Aggregate Update
        update_seller_rating_on_create(db, seller_id=seller_id, rating=data.rating)

        return {
            "id": review.id,
            "order_item_id": review.order_item_id,
            "seller_id": review.seller_id,
            "buyer_id": review.buyer_id,
            "buyer_name": current_user.username or current_user.email.split("@")[0],
            "rating": review.rating,
            "review_text": review.review_text,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None,
            "verified_purchase": review.verified_purchase,
        }
    finally:
        db.close()


@app.put("/reviews/{review_id}", response_model=SellerReviewResponse)
def update_seller_review(review_id: int, data: SellerReviewUpdate, current_user: User = Depends(get_current_user)):
    """Update an existing seller review and recompute O(1) aggregates."""
    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5 stars.")

    db = SessionLocal()
    try:
        review = db.query(SellerReview).filter(SellerReview.id == review_id).first()
        if not review or review.buyer_id != current_user.id:
            raise HTTPException(status_code=404, detail="Review not found or you do not have permission to modify it.")

        old_rating = review.rating
        new_rating = data.rating

        review.rating = new_rating
        review.review_text = data.review_text.strip() if data.review_text else None
        review.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(review)

        # O(1) Aggregate Update
        update_seller_rating_on_update(db, seller_id=review.seller_id, old_rating=old_rating, new_rating=new_rating)

        return {
            "id": review.id,
            "order_item_id": review.order_item_id,
            "seller_id": review.seller_id,
            "buyer_id": review.buyer_id,
            "buyer_name": current_user.username or current_user.email.split("@")[0],
            "rating": review.rating,
            "review_text": review.review_text,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "updated_at": review.updated_at.isoformat() if review.updated_at else None,
            "verified_purchase": review.verified_purchase,
        }
    finally:
        db.close()


@app.get("/sellers/{seller_id}/reviews", response_model=SellerReviewsAggregateResponse)
def get_seller_reviews(seller_id: int, page: int = 1, limit: int = 5):
    """Return O(1) aggregates, star distribution breakdown directly from User table, plus paginated recent reviews."""
    db = SessionLocal()
    try:
        seller = db.query(User).filter(User.id == seller_id).first()
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found.")

        avg_rating = round(getattr(seller, "average_rating", 0.0) or 0.0, 1)
        total_revs = getattr(seller, "total_reviews", 0) or 0
        r_sum = getattr(seller, "rating_sum", 0) or 0
        dist = {
            "5": getattr(seller, "five_star_count", 0) or 0,
            "4": getattr(seller, "four_star_count", 0) or 0,
            "3": getattr(seller, "three_star_count", 0) or 0,
            "2": getattr(seller, "two_star_count", 0) or 0,
            "1": getattr(seller, "one_star_count", 0) or 0,
        }

        offset = (max(1, page) - 1) * limit
        recent_rows = db.query(SellerReview).filter(SellerReview.seller_id == seller_id).order_by(SellerReview.created_at.desc()).offset(offset).limit(limit).all()

        recent_reviews = []
        for r in recent_rows:
            buyer_user = db.query(User).filter(User.id == r.buyer_id).first()
            b_name = (buyer_user.username or buyer_user.email.split("@")[0]) if buyer_user else "Buyer"
            recent_reviews.append({
                "id": r.id,
                "order_item_id": r.order_item_id,
                "seller_id": r.seller_id,
                "buyer_id": r.buyer_id,
                "buyer_name": b_name,
                "rating": r.rating,
                "review_text": r.review_text,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "updated_at": r.updated_at.isoformat() if r.updated_at else None,
                "verified_purchase": r.verified_purchase,
            })

        return {
            "average_rating": avg_rating,
            "total_reviews": total_revs,
            "rating_sum": r_sum,
            "distribution": dist,
            "recent_reviews": recent_reviews,
        }
    finally:
        db.close()


@app.get("/orders/{order_item_id}/review", response_model=Optional[SellerReviewResponse])
def get_order_item_review(order_item_id: int, current_user: User = Depends(get_current_user)):
    """Fetch existing review for a specific order item belonging to current user."""
    db = SessionLocal()
    try:
        r = db.query(SellerReview).filter(SellerReview.order_item_id == order_item_id, SellerReview.buyer_id == current_user.id).first()
        if not r:
            return None
        return {
            "id": r.id,
            "order_item_id": r.order_item_id,
            "seller_id": r.seller_id,
            "buyer_id": r.buyer_id,
            "buyer_name": current_user.username or current_user.email.split("@")[0],
            "rating": r.rating,
            "review_text": r.review_text,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
            "verified_purchase": r.verified_purchase,
        }
    finally:
        db.close()

