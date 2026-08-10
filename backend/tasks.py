"""
tasks.py
========
Background / scheduled tasks for Zellers.

Currently handles:
  - Expiring PENDING conversations after 7 days (run on app startup via
    asyncio.create_task or a periodic scheduler like APScheduler/Celery Beat).

Usage (from main.py):
    from tasks import periodic_expire_task
    asyncio.create_task(periodic_expire_task())
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from database import SessionLocal
from models import Conversation, ConversationStatus, NotificationType
from notifications import NotificationService

logger = logging.getLogger(__name__)

PENDING_EXPIRY_DAYS = 7
EXPIRY_POLL_INTERVAL_SECONDS = 60 * 60  # Run every hour


def expire_pending_conversations(db: Session) -> int:
    """
    Synchronously expire all PENDING conversations older than PENDING_EXPIRY_DAYS.
    Returns the number of conversations expired.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=PENDING_EXPIRY_DAYS)

    expired_convs = (
        db.query(Conversation)
        .filter(
            Conversation.status == ConversationStatus.PENDING,
            Conversation.created_at < cutoff,
        )
        .all()
    )

    count = 0
    for conv in expired_convs:
        conv.status = ConversationStatus.EXPIRED

        # Notify the buyer that their request expired
        NotificationService.create(
            db,
            user_id=conv.buyer_id,
            notification_type=NotificationType.SYSTEM,
            title="Chat Request Expired",
            body=f'Your chat request about "{conv.product_title}" has expired after {PENDING_EXPIRY_DAYS} days.',
            reference_id=conv.id,
        )
        count += 1

    if count:
        db.commit()
        logger.info("Expired %d pending conversations.", count)

    return count


async def periodic_expire_task():
    """
    Async background loop that calls expire_pending_conversations every hour.
    Start with: asyncio.create_task(periodic_expire_task())
    """
    while True:
        try:
            db = SessionLocal()
            try:
                expired = expire_pending_conversations(db)
                if expired:
                    logger.info("[tasks] Expired %d PENDING conversations.", expired)
            finally:
                db.close()
        except Exception:
            logger.exception("[tasks] Error in periodic_expire_task")

        await asyncio.sleep(EXPIRY_POLL_INTERVAL_SECONDS)
