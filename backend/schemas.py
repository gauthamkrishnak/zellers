from datetime import datetime
from typing import Optional, List, Union
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
    mode: Optional[str] = None
    product_id: Optional[int] = None


class PaymentFailureRequest(BaseModel):
    razorpay_order_id: Optional[str] = None
    error_description: Optional[str] = None
    mode: Optional[str] = None
    product_id: Optional[int] = None


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
    seller_name: Optional[str] = None
    is_wishlisted: Optional[bool] = None
    boost_status: Optional[str] = None
    boost_start_date: Optional[Union[datetime, str]] = None
    boost_end_date: Optional[Union[datetime, str]] = None
    active_boost_id: Optional[int] = None
    is_active_boost: Optional[bool] = False

    class Config:
        from_attributes = True


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int] = None
    price: int
    title: Optional[str] = None
    snapshot_product_title: Optional[str] = None
    snapshot_brand: Optional[str] = None
    snapshot_category: Optional[str] = None
    snapshot_condition: Optional[str] = None
    snapshot_price_paid: Optional[int] = None
    snapshot_original_price: Optional[int] = None
    snapshot_location: Optional[str] = None
    snapshot_description: Optional[str] = None
    snapshot_primary_image: Optional[str] = None
    snapshot_image_urls: Optional[str] = None
    snapshot_seller_name: Optional[str] = None
    snapshot_seller_id: Optional[int] = None
    snapshot_purchase_time: Optional[str] = None

    class Config:
        from_attributes = True


class PurchaseHistoryItem(BaseModel):
    order_id: int
    order_date: str
    payment_id: str
    payment_method: str
    payment_status: str
    order_status: str
    product_id: Optional[int] = None
    product_title: str
    brand: str
    category: str
    condition: str
    current_product_status: str  # 'available', 'sold', or 'deleted'
    current_product_image: str
    purchased_price: int
    original_price: int
    quantity: int
    seller_id: Optional[int] = None
    seller_name: str
    seller_profile_image: Optional[str] = None
    location: str

    # Immutable snapshot values
    snapshot_product_title: str
    snapshot_brand: str
    snapshot_category: str
    snapshot_condition: str
    snapshot_price_paid: int
    snapshot_original_price: int
    snapshot_location: str
    snapshot_description: str
    snapshot_primary_image: str
    snapshot_image_urls: str
    snapshot_seller_name: str
    snapshot_seller_id: Optional[int] = None
    snapshot_purchase_time: str
    product_exists: bool
    is_sold: bool

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: int
    payment_type: str
    amount: int
    currency: str
    payment_gateway: str
    payment_id: str
    razorpay_order_id: str
    status: str
    created_at: Optional[Union[datetime, str]] = None

    class Config:
        from_attributes = True


class ProductBoostResponse(BaseModel):
    id: int
    product_id: int
    seller_id: int
    payment_id: int
    boost_plan: str
    amount_paid: int
    boost_start_date: Optional[Union[datetime, str]] = None
    boost_end_date: Optional[Union[datetime, str]] = None
    status: str
    created_at: Optional[Union[datetime, str]] = None

    class Config:
        from_attributes = True


class BoostInitiateResponse(BaseModel):
    razorpay_order_id: str
    razorpay_key_id: str
    amount: int
    currency: str
    amount_inr: int
    key: str
    id: str


class BoostVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


