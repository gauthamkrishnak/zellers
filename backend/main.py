from fastapi import FastAPI
from database import engine
from models import Base
from database import SessionLocal
from models import Product

app = FastAPI()

# Create all tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Hello World"}
@app.get("/products")
def get_products():

    db = SessionLocal()

    products = db.query(Product).all()

    db.close()

    return products