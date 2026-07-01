from database import SessionLocal
from models import Product
from products import products

db = SessionLocal()

for item in products:
    product = Product(**item)
    db.add(product)

db.commit()
db.close()

print("Products inserted successfully!")