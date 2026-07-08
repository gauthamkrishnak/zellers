from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base, Product,User
from schemas import UserRegister, UserLogin
from auth import hash_password, verify_password, create_access_token
from jose import jwt, JWTError
from auth import SECRET_KEY, ALGORITHM
from fastapi.staticfiles import StaticFiles

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


@app.get("/")
def home():
    return {"message": "Hello World"}


# GET all products, with backend filtering
@app.get("/products/")
def get_products(category: str = "All", search: str = ""):
    db = SessionLocal()

    query = db.query(Product)

    if category != "All":
        query = query.filter(Product.type == category)

    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    products = query.all()

    db.close()

    return products
   

# PUT: toggle one product's wishlist status
# @app.put("/products/{product_id}/wishlist")
# def update_wishlist(product_id: int):
#     db = SessionLocal()

#     product = db.query(Product).filter(Product.id == product_id).first()

#     if product is None:
#         db.close()
#         raise HTTPException(status_code=404, detail="Product not found")

#     product.is_wishlisted = not product.is_wishlisted

#     db.commit()
#     db.refresh(product)

#     db.close()

#     return product
@app.get("/wishlist/")
def get_wishlist():
    db = SessionLocal()

    wishlist_products = (
        db.query(Product)
        .filter(Product.is_wishlisted == True)
        .all()
    )

    db.close()

    return wishlist_products
@app.get("/products/{product_id}")
def get_product(product_id: int):
    db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    db.close()

    return product


@app.put("/products/{product_id}/wishlist")
def update_wishlist(product_id: int):
    db = SessionLocal()

    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        db.close()
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_wishlisted = not product.is_wishlisted

    db.commit()
    db.refresh(product)
    db.close()

    return product
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