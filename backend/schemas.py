from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None



class UserLogin(BaseModel):
    email: EmailStr
    password: str