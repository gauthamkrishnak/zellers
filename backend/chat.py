"""
chat.py
=======
REST endpoints and WebSocket handler for the Zellers buyer-seller chat system.

REST Routes
-----------
  POST   /chat/conversations                    Create or return existing conversation
  GET    /chat/conversations                    List conversations (paginated)
  GET    /chat/conversations/{id}               Conversation detail + messages
  POST   /chat/conversations/{id}/accept        Seller accepts (PENDING -> ACTIVE)
  POST   /chat/conversations/{id}/reject        Seller rejects (PENDING -> REJECTED)
  POST   /chat/messages                         Send a message

  GET    /notifications                         List notifications (paginated)
  PUT    /notifications/{id}/read               Mark notification as read
  PUT    /notifications/read-all                Mark all notifications as read

WebSocket
---------
  WS     /ws/chat?token=<jwt_token>

  Client -> Server event types:
    MESSAGE   { type, conversation_id, content }
    TYPING    { type, conversation_id, is_typing }
    READ      { type, conversation_id }

  Server -> Client event types:
    MESSAGE         { type, data: MessageResponse }
    TYPING          { type, data: { conversation_id, user_id, is_typing } }
    READ            { type, data: { conversation_id, user_id } }
    STATUS_CHANGE   { type, data: { conversation_id, status } }
    NOTIFICATION    { type, data: NotificationResponse }
    ERROR           { type, data: { message } }
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError, jwt
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from auth import SECRET_KEY, ALGORITHM
from database import SessionLocal
from models import (
    Conversation, ConversationStatus, ConversationType,
    Message, Notification, NotificationType, Product, User,
)
from notifications import NotificationService, manager
from schemas import (
    ConversationCreate, ConversationDetailResponse, ConversationListItem,
    MessageCreate, MessageResponse, NotificationResponse,
    PaginatedConversations, PaginatedNotifications,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_current_user_from_token(token: str, db: Session) -> User:
    """Decode a JWT and return the corresponding User. Raises HTTPException on failure."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user


def _require_auth(Authorization: str, db: Session) -> User:
    """Extract Bearer token from Authorization header and return the user."""
    if not Authorization or not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = Authorization.split(" ", 1)[1]
    return _get_current_user_from_token(token, db)


def _build_message_response(msg: Message) -> dict:
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "sender_name": msg.sender.username if msg.sender else None,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
        "is_read": msg.is_read,
    }


def _build_conv_list_item(conv: Conversation, current_user_id: int) -> dict:
    is_buyer = conv.buyer_id == current_user_id
    other_party = conv.seller if is_buyer else conv.buyer
    my_unread = conv.buyer_unread_count if is_buyer else conv.seller_unread_count
    return {
        "id": conv.id,
        "conversation_type": conv.conversation_type if isinstance(conv.conversation_type, str) else conv.conversation_type.value,
        "other_party_id": other_party.id if other_party else 0,
        "other_party_name": other_party.username if other_party else None,
        "product_id": conv.product_id,
        "status": conv.status if isinstance(conv.status, str) else conv.status.value,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "product_title": conv.product_title,
        "product_thumbnail": conv.product_thumbnail,
        "product_price": conv.product_price,
        "last_message": conv.last_message,
        "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else None,
        "my_unread_count": my_unread,
    }


# ---------------------------------------------------------------------------
# Valid state transitions (server-side state machine)
# ---------------------------------------------------------------------------

VALID_TRANSITIONS: dict[ConversationStatus, list[ConversationStatus]] = {
    ConversationStatus.PENDING: [ConversationStatus.ACTIVE, ConversationStatus.REJECTED, ConversationStatus.EXPIRED],
    ConversationStatus.ACTIVE: [ConversationStatus.CLOSED, ConversationStatus.BLOCKED],
    ConversationStatus.REJECTED: [],
    ConversationStatus.EXPIRED: [],
    ConversationStatus.CLOSED: [],
    ConversationStatus.BLOCKED: [],
}


def _assert_transition(current: ConversationStatus, target: ConversationStatus):
    if target not in VALID_TRANSITIONS.get(current, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {current} to {target}",
        )


# ---------------------------------------------------------------------------
# Conversation Endpoints
# ---------------------------------------------------------------------------

@router.post("/chat/conversations", status_code=201)
def create_conversation(
    body: ConversationCreate,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """
    Create a new conversation or return the existing one.
    Buyer sends the first message as part of initiation.
    Enforces the composite unique constraint gracefully.
    """
    from fastapi import Header
    current_user = _require_auth(Authorization, db)

    # Resolve product & seller
    product = db.query(Product).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.is_sold:
        raise HTTPException(status_code=409, detail="This product has already been sold")
    seller_id = product.user_id
    if seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot chat with yourself about your own listing")

    # Check composite unique — return existing conversation if found
    existing = (
        db.query(Conversation)
        .filter(
            Conversation.buyer_id == current_user.id,
            Conversation.seller_id == seller_id,
            Conversation.product_id == body.product_id,
        )
        .first()
    )
    if existing:
        return {"conversation_id": existing.id, "created": False}

    # Create conversation with product snapshot
    now = datetime.now(timezone.utc)
    conv = Conversation(
        conversation_type=ConversationType.PRODUCT,
        buyer_id=current_user.id,
        seller_id=seller_id,
        product_id=body.product_id,
        status=ConversationStatus.PENDING,
        created_at=now,
        last_message_time=now,
        # Immutable snapshot
        product_title=product.title,
        product_thumbnail=product.image,
        product_price=product.price,
        # Seller has 1 unread (the initial message)
        seller_unread_count=1,
        buyer_unread_count=0,
    )
    db.add(conv)
    db.flush()  # Get conv.id before saving message

    # Save the initial message
    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=body.initial_message,
        created_at=now,
        is_read=False,
    )
    db.add(msg)
    db.flush()

    # Update denormalized preview on conversation
    conv.last_message = body.initial_message
    conv.last_message_time = now
    conv.last_sender_id = current_user.id

    # Create notification for seller
    notif = NotificationService.create(
        db,
        user_id=seller_id,
        notification_type=NotificationType.NEW_CHAT_REQUEST,
        title="New Chat Request",
        body=f"{current_user.username} is interested in your listing: {product.title}",
        reference_id=conv.id,
    )

    db.commit()
    db.refresh(conv)
    db.refresh(notif)

    return {"conversation_id": conv.id, "created": True}


@router.get("/chat/conversations")
def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """
    Return all conversations for the current user (as buyer or seller),
    sorted by last_message_time descending. Paginated.
    """
    current_user = _require_auth(Authorization, db)

    base_q = (
        db.query(Conversation)
        .options(
            joinedload(Conversation.buyer),
            joinedload(Conversation.seller),
        )
        .filter(
            (Conversation.buyer_id == current_user.id) |
            (Conversation.seller_id == current_user.id)
        )
        .order_by(Conversation.last_message_time.desc())
    )

    total = base_q.count()
    convs = base_q.offset((page - 1) * page_size).limit(page_size).all()

    items = [_build_conv_list_item(c, current_user.id) for c in convs]
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_next": (page * page_size) < total,
    }


@router.get("/chat/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """
    Return conversation details with all messages.
    Resets the requesting user's unread count.
    """
    current_user = _require_auth(Authorization, db)

    conv = (
        db.query(Conversation)
        .options(
            joinedload(Conversation.buyer),
            joinedload(Conversation.seller),
            joinedload(Conversation.messages).joinedload(Message.sender),
        )
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    is_buyer = conv.buyer_id == current_user.id
    is_seller = conv.seller_id == current_user.id
    if not is_buyer and not is_seller:
        raise HTTPException(status_code=403, detail="Access denied")

    # Reset unread count for the requesting party
    if is_buyer:
        conv.buyer_unread_count = 0
    else:
        conv.seller_unread_count = 0

    # Mark all messages sent by the other party as read
    other_id = conv.seller_id if is_buyer else conv.buyer_id
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id == other_id,
        Message.is_read == False,
    ).update({"is_read": True})

    db.commit()
    db.refresh(conv)

    my_unread = conv.buyer_unread_count if is_buyer else conv.seller_unread_count
    messages = [_build_message_response(m) for m in conv.messages]

    return {
        "id": conv.id,
        "conversation_type": conv.conversation_type if isinstance(conv.conversation_type, str) else conv.conversation_type.value,
        "buyer_id": conv.buyer_id,
        "buyer_name": conv.buyer.username if conv.buyer else None,
        "seller_id": conv.seller_id,
        "seller_name": conv.seller.username if conv.seller else None,
        "product_id": conv.product_id,
        "status": conv.status if isinstance(conv.status, str) else conv.status.value,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "accepted_at": conv.accepted_at.isoformat() if conv.accepted_at else None,
        "rejected_at": conv.rejected_at.isoformat() if conv.rejected_at else None,
        "product_title": conv.product_title,
        "product_thumbnail": conv.product_thumbnail,
        "product_price": conv.product_price,
        "my_unread_count": my_unread,
        "messages": messages,
    }


@router.post("/chat/conversations/{conversation_id}/accept")
async def accept_conversation(
    conversation_id: int,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """Seller accepts a PENDING conversation -> ACTIVE."""
    current_user = _require_auth(Authorization, db)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can accept a conversation")

    current_status = ConversationStatus(conv.status) if isinstance(conv.status, str) else conv.status
    _assert_transition(current_status, ConversationStatus.ACTIVE)

    now = datetime.now(timezone.utc)
    conv.status = ConversationStatus.ACTIVE
    conv.accepted_at = now

    # Notify buyer
    buyer = db.query(User).filter(User.id == conv.buyer_id).first()
    notif = NotificationService.create(
        db,
        user_id=conv.buyer_id,
        notification_type=NotificationType.CHAT_ACCEPTED,
        title="Chat Request Accepted",
        body=f"{current_user.username} accepted your chat request about \"{conv.product_title}\".",
        reference_id=conv.id,
    )

    db.commit()
    db.refresh(conv)
    db.refresh(notif)

    # Push STATUS_CHANGE to buyer over WebSocket
    await manager.send_to_user(conv.buyer_id, {
        "type": "STATUS_CHANGE",
        "data": {
            "conversation_id": conv.id,
            "status": ConversationStatus.ACTIVE.value,
        },
    })
    # Push NOTIFICATION to buyer over WebSocket
    await NotificationService.push(conv.buyer_id, notif)

    return {"conversation_id": conv.id, "status": ConversationStatus.ACTIVE.value}


@router.post("/chat/conversations/{conversation_id}/reject")
async def reject_conversation(
    conversation_id: int,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """Seller rejects a PENDING conversation -> REJECTED."""
    current_user = _require_auth(Authorization, db)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the seller can reject a conversation")

    current_status = ConversationStatus(conv.status) if isinstance(conv.status, str) else conv.status
    _assert_transition(current_status, ConversationStatus.REJECTED)

    now = datetime.now(timezone.utc)
    conv.status = ConversationStatus.REJECTED
    conv.rejected_at = now

    # Notify buyer
    notif = NotificationService.create(
        db,
        user_id=conv.buyer_id,
        notification_type=NotificationType.CHAT_REJECTED,
        title="Chat Request Declined",
        body=f"{current_user.username} declined your chat request about \"{conv.product_title}\".",
        reference_id=conv.id,
    )

    db.commit()
    db.refresh(conv)
    db.refresh(notif)

    await manager.send_to_user(conv.buyer_id, {
        "type": "STATUS_CHANGE",
        "data": {
            "conversation_id": conv.id,
            "status": ConversationStatus.REJECTED.value,
        },
    })
    await NotificationService.push(conv.buyer_id, notif)

    return {"conversation_id": conv.id, "status": ConversationStatus.REJECTED.value}


@router.post("/chat/messages", status_code=201)
async def send_message(
    body: MessageCreate,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """
    Send a message in an existing conversation via REST.
    Permission matrix:
      PENDING -> only buyer can send (only 1st msg; already sent at conversation creation).
                 Use this endpoint for re-attempts or fallback.
      ACTIVE  -> both parties can send.
      Other   -> 403 Forbidden.
    """
    current_user = _require_auth(Authorization, db)

    conv = (
        db.query(Conversation)
        .options(joinedload(Conversation.buyer), joinedload(Conversation.seller))
        .filter(Conversation.id == body.conversation_id)
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    is_buyer = conv.buyer_id == current_user.id
    is_seller = conv.seller_id == current_user.id
    if not is_buyer and not is_seller:
        raise HTTPException(status_code=403, detail="Access denied")

    current_status = ConversationStatus(conv.status) if isinstance(conv.status, str) else conv.status

    # Permission matrix
    if current_status == ConversationStatus.ACTIVE:
        pass  # both parties allowed
    elif current_status == ConversationStatus.PENDING and is_buyer:
        pass  # buyer allowed to send (their initial message was already sent; this is a no-op guard)
    else:
        raise HTTPException(status_code=403, detail=f"Cannot send messages when conversation is {current_status.value}")

    now = datetime.now(timezone.utc)
    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=body.content,
        created_at=now,
        is_read=False,
    )
    db.add(msg)
    db.flush()

    # Update denormalized preview
    conv.last_message = body.content
    conv.last_message_time = now
    conv.last_sender_id = current_user.id

    # Increment the other party's unread counter
    if is_buyer:
        conv.seller_unread_count = (conv.seller_unread_count or 0) + 1
    else:
        conv.buyer_unread_count = (conv.buyer_unread_count or 0) + 1

    db.commit()
    db.refresh(msg)

    msg_payload = _build_message_response(msg)

    # Push to the other party over WebSocket
    other_id = conv.seller_id if is_buyer else conv.buyer_id
    await manager.send_to_user(other_id, {"type": "MESSAGE", "data": msg_payload})

    return msg_payload


# ---------------------------------------------------------------------------
# Notification Endpoints
# ---------------------------------------------------------------------------

@router.get("/notifications")
def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """List notifications for the current user, newest first."""
    current_user = _require_auth(Authorization, db)

    base_q = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    total = base_q.count()
    unread_count = base_q.filter(Notification.is_read == False).count()
    items = base_q.offset((page - 1) * page_size).limit(page_size).all()

    def _serialize(n: Notification) -> dict:
        return {
            "id": n.id,
            "user_id": n.user_id,
            "type": n.type if isinstance(n.type, str) else n.type.value,
            "title": n.title,
            "body": n.body,
            "reference_id": n.reference_id,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }

    return {
        "items": [_serialize(n) for n in items],
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "page_size": page_size,
        "has_next": (page * page_size) < total,
    }


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """Mark a single notification as read."""
    current_user = _require_auth(Authorization, db)

    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if notif:
        notif.is_read = True
        db.commit()
        return {"id": notif.id, "is_read": True}
    return {"status": "not_found"}

@router.put("/notifications/read-all")
def mark_all_notifications_read(
    Authorization: str = "",
    db: Session = Depends(get_db),
):
    """Mark all notifications for the current user as read."""
    current_user = _require_auth(Authorization, db)

    updated = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read == False)
        .update({"is_read": True})
    )
    db.commit()
    return {"updated": updated}


# ---------------------------------------------------------------------------
# WebSocket Handler
# ---------------------------------------------------------------------------

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, token: str = Query(...)):
    """
    Unified WebSocket endpoint for real-time chat events.
    Authenticated via ?token=<jwt_token> query parameter.

    Accepted client events:
      MESSAGE   { type, conversation_id, content }
      TYPING    { type, conversation_id, is_typing }
      READ      { type, conversation_id }
    """
    # Authenticate before accepting the connection
    db = SessionLocal()
    try:
        current_user = _get_current_user_from_token(token, db)
    except HTTPException:
        await websocket.close(code=4001)
        db.close()
        return

    await manager.connect(websocket, current_user.id)
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "MESSAGE":
                await _ws_handle_message(websocket, current_user, data, db)

            elif event_type == "TYPING":
                await _ws_handle_typing(current_user, data)

            elif event_type == "READ":
                await _ws_handle_read(current_user, data, db)

            else:
                await websocket.send_json({"type": "ERROR", "data": {"message": f"Unknown event type: {event_type}"}})

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            await websocket.send_json({"type": "ERROR", "data": {"message": str(exc)}})
        except Exception:
            pass
    finally:
        manager.disconnect(websocket, current_user.id)
        db.close()


async def _ws_handle_message(websocket: WebSocket, current_user: User, data: dict, db: Session):
    """Handle a MESSAGE event from the WebSocket client."""
    conversation_id = data.get("conversation_id")
    content = data.get("content", "").strip()

    if not conversation_id or not content:
        await websocket.send_json({"type": "ERROR", "data": {"message": "conversation_id and content are required"}})
        return

    conv = (
        db.query(Conversation)
        .options(joinedload(Conversation.buyer), joinedload(Conversation.seller))
        .filter(Conversation.id == conversation_id)
        .first()
    )
    if not conv:
        await websocket.send_json({"type": "ERROR", "data": {"message": "Conversation not found"}})
        return

    is_buyer = conv.buyer_id == current_user.id
    is_seller = conv.seller_id == current_user.id
    if not is_buyer and not is_seller:
        await websocket.send_json({"type": "ERROR", "data": {"message": "Access denied"}})
        return

    current_status = ConversationStatus(conv.status) if isinstance(conv.status, str) else conv.status

    # Permission check
    allowed = (
        current_status == ConversationStatus.ACTIVE or
        (current_status == ConversationStatus.PENDING and is_buyer)
    )
    if not allowed:
        await websocket.send_json({
            "type": "ERROR",
            "data": {"message": f"Cannot send messages when conversation is {current_status.value}"},
        })
        return

    now = datetime.now(timezone.utc)
    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        content=content,
        created_at=now,
        is_read=False,
    )
    db.add(msg)
    db.flush()

    conv.last_message = content
    conv.last_message_time = now
    conv.last_sender_id = current_user.id

    if is_buyer:
        conv.seller_unread_count = (conv.seller_unread_count or 0) + 1
    else:
        conv.buyer_unread_count = (conv.buyer_unread_count or 0) + 1

    db.commit()
    db.refresh(msg)

    msg_payload = _build_message_response(msg)

    # Echo back to sender (for multi-tab support)
    await websocket.send_json({"type": "MESSAGE", "data": msg_payload})

    # Deliver to the other party
    other_id = conv.seller_id if is_buyer else conv.buyer_id
    await manager.send_to_user(other_id, {"type": "MESSAGE", "data": msg_payload})


async def _ws_handle_typing(current_user: User, data: dict):
    """Broadcast a TYPING indicator to the other party."""
    conversation_id = data.get("conversation_id")
    is_typing = bool(data.get("is_typing", False))
    # We don't have the conversation here without a DB query — we rely on the
    # client sending the other_party_id, or we do a lightweight lookup.
    # For now, the client must send target_user_id in the typing event.
    target_user_id = data.get("target_user_id")
    if not target_user_id:
        return

    await manager.send_to_user(int(target_user_id), {
        "type": "TYPING",
        "data": {
            "conversation_id": conversation_id,
            "user_id": current_user.id,
            "is_typing": is_typing,
        },
    })


async def _ws_handle_read(current_user: User, data: dict, db: Session):
    """Mark messages as read and notify the sender."""
    conversation_id = data.get("conversation_id")
    if not conversation_id:
        return

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        return

    is_buyer = conv.buyer_id == current_user.id
    is_seller = conv.seller_id == current_user.id
    if not is_buyer and not is_seller:
        return

    other_id = conv.seller_id if is_buyer else conv.buyer_id

    # Mark all unread messages from the other party as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id == other_id,
        Message.is_read == False,
    ).update({"is_read": True})

    # Reset our unread counter
    if is_buyer:
        conv.buyer_unread_count = 0
    else:
        conv.seller_unread_count = 0

    db.commit()

    # Notify the other party that their messages were read
    await manager.send_to_user(other_id, {
        "type": "READ",
        "data": {
            "conversation_id": conversation_id,
            "user_id": current_user.id,
        },
    })
