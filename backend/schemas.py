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