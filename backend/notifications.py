"""
notifications.py
================
Centralized notification service for Zellers.

Responsibilities:
  - `NotificationService.create()` — persist a Notification row and push it
    over WebSocket to the target user (if online).
  - `ConnectionManager` — WebSocket registry: add/remove connections per user
    and broadcast JSON payloads.
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Set

from fastapi import WebSocket
from sqlalchemy.orm import Session

from models import Notification, NotificationType


# ---------------------------------------------------------------------------
# WebSocket Connection Manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    """
    Maintains a mapping of user_id -> set of active WebSocket connections.
    Supports multiple tabs / devices per user.
    """

    def __init__(self):
        # user_id -> set of connected WebSocket objects
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = set()
        self._connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self._connections:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                del self._connections[user_id]

    def is_online(self, user_id: int) -> bool:
        return bool(self._connections.get(user_id))

    async def send_to_user(self, user_id: int, payload: dict):
        """Fan-out a JSON payload to all connections of a specific user."""
        connections = list(self._connections.get(user_id, []))
        if not connections:
            return
        dead: list[WebSocket] = []
        for ws in connections:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

    async def broadcast(self, payload: dict):
        """Broadcast a JSON payload to ALL connected users."""
        for user_id in list(self._connections.keys()):
            await self.send_to_user(user_id, payload)


# Singleton shared across the application
manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Notification Service
# ---------------------------------------------------------------------------

class NotificationService:
    """
    Utility class for creating Notification records and delivering them
    in real-time over WebSocket.
    """

    @staticmethod
    def create(
        db: Session,
        *,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        body: str,
        reference_id: int | None = None,
    ) -> Notification:
        """
        Persist a notification row in the database.
        Returns the saved Notification object.

        NOTE: The caller is responsible for db.commit() to keep this
        composable within larger transactions.
        """
        notif = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            body=body,
            reference_id=reference_id,
            is_read=False,
            created_at=datetime.now(timezone.utc),
        )
        db.add(notif)
        db.flush()  # Assign ID without committing (caller commits)
        return notif

    @staticmethod
    async def push(user_id: int, notif: Notification):
        """
        Push a NOTIFICATION event to the user over WebSocket (fire-and-forget).
        Safe to call even when the user is offline — no-op in that case.
        """
        payload = {
            "type": "NOTIFICATION",
            "data": {
                "id": notif.id,
                "type": notif.type if isinstance(notif.type, str) else notif.type.value,
                "title": notif.title,
                "body": notif.body,
                "reference_id": notif.reference_id,
                "is_read": notif.is_read,
                "created_at": notif.created_at.isoformat() if notif.created_at else None,
            },
        }
        await manager.send_to_user(user_id, payload)

    @staticmethod
    async def create_and_push(
        db: Session,
        *,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        body: str,
        reference_id: int | None = None,
    ) -> Notification:
        """
        Convenience wrapper: persist + push.
        Flushes but does NOT commit — caller must commit.
        """
        notif = NotificationService.create(
            db,
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            body=body,
            reference_id=reference_id,
        )
        # Schedule the WS push without blocking the DB transaction
        asyncio.create_task(NotificationService.push(user_id, notif))
        return notif
