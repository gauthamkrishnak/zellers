from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    price = Column(Integer)
    highest_price = Column(Integer, nullable=True)
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
    active_boost_id = Column(Integer, ForeignKey("product_boosts.id", ondelete="SET NULL"), nullable=True)
    seller = relationship("User", foreign_keys=[user_id])


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)

    # O(1) Seller Rating & Review Aggregates
    average_rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    rating_sum = Column(Integer, default=0)
    one_star_count = Column(Integer, default=0)
    two_star_count = Column(Integer, default=0)
    three_star_count = Column(Integer, default=0)
    four_star_count = Column(Integer, default=0)
    five_star_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)

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
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
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
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
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


class SellerReview(Base):
    __tablename__ = "seller_reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), unique=True, nullable=False, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    review_text = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    verified_purchase = Column(Boolean, default=True)

    # Future-ready extensible columns
    seller_reply = Column(String, nullable=True)
    seller_reply_created_at = Column(DateTime(timezone=True), nullable=True)
    likes_count = Column(Integer, default=0)
    photos_json = Column(String, nullable=True)
    is_moderated = Column(Boolean, default=False)
    report_count = Column(Integer, default=0)

    order_item = relationship("OrderItem", foreign_keys=[order_item_id])
    seller = relationship("User", foreign_keys=[seller_id])
    buyer = relationship("User", foreign_keys=[buyer_id])

