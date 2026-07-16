from models import User

def _get_star_attr(rating: int) -> str:
    """Map integer rating (1-5) to corresponding User model attribute."""
    mapping = {
        1: "one_star_count",
        2: "two_star_count",
        3: "three_star_count",
        4: "four_star_count",
        5: "five_star_count",
    }
    return mapping.get(rating, "five_star_count")

def update_seller_rating_on_create(db, seller_id: int, rating: int):
    """
    O(1) aggregate update when a new review is created.
    Increments rating_sum, total_reviews, appropriate star counter, and recalculates average_rating.
    """
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        return

    # Initialize defaults if None
    seller.rating_sum = (seller.rating_sum or 0) + rating
    seller.total_reviews = (seller.total_reviews or 0) + 1

    star_attr = _get_star_attr(rating)
    current_count = getattr(seller, star_attr, 0) or 0
    setattr(seller, star_attr, current_count + 1)

    if seller.total_reviews > 0:
        seller.average_rating = round(seller.rating_sum / seller.total_reviews, 2)
    else:
        seller.average_rating = 0.0

    db.commit()
    db.refresh(seller)

def update_seller_rating_on_update(db, seller_id: int, old_rating: int, new_rating: int):
    """
    O(1) aggregate update when an existing review is modified.
    Subtracts old_rating, adds new_rating to rating_sum, shifts star counters, and recalculates average_rating.
    """
    if old_rating == new_rating:
        return

    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        return

    seller.rating_sum = (seller.rating_sum or 0) - old_rating + new_rating
    seller.total_reviews = seller.total_reviews or 0

    # Decrement old star counter
    old_attr = _get_star_attr(old_rating)
    old_count = getattr(seller, old_attr, 0) or 0
    if old_count > 0:
        setattr(seller, old_attr, old_count - 1)

    # Increment new star counter
    new_attr = _get_star_attr(new_rating)
    new_count = getattr(seller, new_attr, 0) or 0
    setattr(seller, new_attr, new_count + 1)

    if seller.total_reviews > 0:
        seller.average_rating = round(seller.rating_sum / seller.total_reviews, 2)
    else:
        seller.average_rating = 0.0

    db.commit()
    db.refresh(seller)

def update_seller_rating_on_delete(db, seller_id: int, rating: int):
    """
    O(1) aggregate update when a review is deleted (future-ready).
    Subtracts rating from rating_sum, decrements total_reviews and star counter, recalculates average_rating.
    """
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        return

    seller.rating_sum = max(0, (seller.rating_sum or 0) - rating)
    seller.total_reviews = max(0, (seller.total_reviews or 0) - 1)

    star_attr = _get_star_attr(rating)
    current_count = getattr(seller, star_attr, 0) or 0
    if current_count > 0:
        setattr(seller, star_attr, current_count - 1)

    if seller.total_reviews > 0:
        seller.average_rating = round(seller.rating_sum / seller.total_reviews, 2)
    else:
        seller.average_rating = 0.0

    db.commit()
    db.refresh(seller)
