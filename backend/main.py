from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base, Product, User, Wishlist, Cart
from schemas import UserRegister, UserLogin
from auth import hash_password, verify_password, create_access_token
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
from fastapi.staticfiles import StaticFiles
from typing import Optional

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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

# Create tables if they do not already exist
Base.metadata.create_all(bind=engine)


# ─── Auth dependency ───────────────────────────────────────────────
def get_current_user_id(authorization: str = Header(...)):
    """Extract user ID from the Bearer token in the Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/")
def home():
    return {"message": "Hello World"}


# ─── Products ──────────────────────────────────────────────────────

@app.get("/products/")
def get_products(
    category: str = "All",
    search: str = "",
    authorization: Optional[str] = Header(None),
):
    db = SessionLocal()

    query = db.query(Product)

    if category != "All":
        query = query.filter(Product.type == category)

    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    products = query.all()

    # Determine wishlisted product IDs for the current user
    wishlisted_ids = set()
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ", 1)[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = int(payload.get("sub"))
            wishlisted_ids = {
                w.product_id
                for w in db.query(Wishlist)
                .filter(Wishlist.user_id == user_id)
                .all()
            }
        except (JWTError, ValueError, TypeError):
            pass

    # Add is_wishlisted field to each product
    result = []
    for p in products:
        result.append({
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "type": p.type,
            "location": p.location,
            "listed": p.listed,
            "image": p.image,
            "desc": p.desc,
            "is_wishlisted": p.id in wishlisted_ids,
        })

    db.close()
    return result


@app.get("/products/{product_id}")
def get_product(
    product_id: int,
    authorization: Optional[str] = Header(None),
):
    db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()

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

    result = {
        "id": product.id,
        "title": product.title,
        "price": product.price,
        "type": product.type,
        "location": product.location,
        "listed": product.listed,
        "image": product.image,
        "desc": product.desc,
        "is_wishlisted": is_wishlisted,
    }

    db.close()
    return result


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
        .filter(Product.id.in_(product_ids))
        .all()
    )

    result = [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "type": p.type,
            "location": p.location,
            "listed": p.listed,
            "image": p.image,
            "desc": p.desc,
            "is_wishlisted": True,
        }
        for p in products
    ]

    db.close()
    return result


@app.put("/products/{product_id}/wishlist")
def toggle_wishlist(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
):
    db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()

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

    result = {
        "id": product.id,
        "title": product.title,
        "price": product.price,
        "type": product.type,
        "location": product.location,
        "listed": product.listed,
        "image": product.image,
        "desc": product.desc,
        "is_wishlisted": is_wishlisted,
    }

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
        .filter(Product.id.in_(product_ids))
        .all()
    )

    result = [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "type": p.type,
            "location": p.location,
            "listed": p.listed,
            "image": p.image,
            "desc": p.desc,
        }
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

    new_user = User(
        email=user.email,
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

    access_token = create_access_token(
        data={"sub": str(existing_user.id)}
    )

    db.close()

    return {
        "access_token": access_token,
        "token_type": "bearer",
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