from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
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
    status = Column(String, default="available")
    is_sold = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    condition = Column(String, nullable=True, default="Excellent")
    brand = Column(String, nullable=True, index=True)
    boost_status = Column(String, nullable=True, default=None)
    boost_start_date = Column(DateTime(timezone=True), nullable=True)
    boost_end_date = Column(DateTime(timezone=True), nullable=True)
    active_boost_id = Column(Integer, ForeignKey("product_boosts.id"), nullable=True)
    seller = relationship("User", foreign_keys=[user_id])


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_cart_user_product"),
    )

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Integer, nullable=False)
    status = Column(String, default="SUCCESS")
    razorpay_order_id = Column(String, nullable=True, index=True)
    razorpay_payment_id = Column(String, nullable=True, index=True)
    razorpay_signature = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price = Column(Integer, nullable=False)
    title = Column(String, nullable=True)

    # Immutable Purchase Snapshots
    snapshot_product_title = Column(String, nullable=True)
    snapshot_brand = Column(String, nullable=True)
    snapshot_category = Column(String, nullable=True)
    snapshot_condition = Column(String, nullable=True)
    snapshot_price_paid = Column(Integer, nullable=True)
    snapshot_original_price = Column(Integer, nullable=True)
    snapshot_location = Column(String, nullable=True)
    snapshot_description = Column(String, nullable=True)
    snapshot_primary_image = Column(String, nullable=True)
    snapshot_image_urls = Column(String, nullable=True)  # JSON string of image URLs
    snapshot_seller_name = Column(String, nullable=True)
    snapshot_seller_id = Column(Integer, nullable=True)
    snapshot_purchase_time = Column(String, nullable=True)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_type = Column(String, nullable=False, index=True)  # 'checkout', 'boost', 'subscription'
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="INR", nullable=False)
    payment_gateway = Column(String, default="Razorpay", nullable=False)
    payment_id = Column(String, nullable=False, index=True)
    razorpay_order_id = Column(String, nullable=False, index=True)
    status = Column(String, default="SUCCESS", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ProductBoost(Base):
    __tablename__ = "product_boosts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    boost_plan = Column(String, default="basic", nullable=False)
    amount_paid = Column(Integer, nullable=False)
    boost_start_date = Column(DateTime(timezone=True), nullable=False)
    boost_end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", foreign_keys=[product_id])
    seller = relationship("User", foreign_keys=[seller_id])
    payment_record = relationship("Payment", foreign_keys=[payment_id])
