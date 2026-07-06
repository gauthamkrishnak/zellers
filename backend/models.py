from sqlalchemy import Column, Integer, String,Boolean
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    price = Column(Integer)
    type = Column(String)
    location = Column(String)
    listed = Column(String)
    image = Column(String)
    desc = Column(String)
    is_wishlisted = Column(Boolean, default=False)