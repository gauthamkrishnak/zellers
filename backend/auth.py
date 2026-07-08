from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt

SECRET_KEY = "change-this-to-a-long-random-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    payload = data.copy()

    expiry = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({"exp": expiry})

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)