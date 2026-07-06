from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import Base, Product

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

