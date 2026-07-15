from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None



class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentFailureRequest(BaseModel):
    razorpay_order_id: Optional[str] = None
    error_description: Optional[str] = None


class ProductCreate(BaseModel):
    title: str
    price: int
    type: str
    location: str
    desc: str
    condition: Optional[str] = "Excellent"
    brand: Optional[str] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    price: Optional[int] = None
    type: Optional[str] = None
    location: Optional[str] = None
    desc: Optional[str] = None
    condition: Optional[str] = None
    brand: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    title: str
    price: int
    type: str
    category: str
    location: str
    listed: str
    image: str
    desc: str
    raw_desc: Optional[str] = None
    condition: str
    brand: Optional[str] = None
    is_brand_new: bool
    status: str
    is_sold: bool
    user_id: Optional[int] = None
    seller_id: Optional[int] = None
    is_wishlisted: Optional[bool] = None

    class Config:
        from_attributes = True
