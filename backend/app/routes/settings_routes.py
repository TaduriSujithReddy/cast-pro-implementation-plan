from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import (
    StoreSettingsOut, StoreSettingsUpdate,
    NotificationOut, SalesDataPoint, UserOut,
)
from ..crud import (
    get_store_settings, update_store_settings,
    get_notifications, mark_notification_read,
    get_sales_chart_data, get_users,
)
from ..auth import get_current_user, require_manager
from ..models import User

router = APIRouter(tags=["Settings & Misc"])


# ── Store Settings ──
@router.get("/settings", response_model=StoreSettingsOut)
def read_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = get_store_settings(db)
    if not s:
        return StoreSettingsOut(id=0, tax_rate=5)
    return s


@router.put("/settings", response_model=StoreSettingsOut)
def edit_settings(data: StoreSettingsUpdate, db: Session = Depends(get_db), _=Depends(require_manager)):
    return update_store_settings(db, data)


# ── Notifications ──
@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return get_notifications(db, user.id if user.role == "biller" else None)


@router.put("/notifications/{notification_id}/read")
def read_notification(notification_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    mark_notification_read(db, notification_id)
    return {"ok": True}


# ── Sales Chart ──
@router.get("/sales-chart", response_model=list[SalesDataPoint])
def sales_chart(days: int = 30, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_sales_chart_data(db, days)


# ── Users (manager only) ──
@router.get("/users", response_model=list[UserOut])
def list_users(role: str | None = None, db: Session = Depends(get_db), _=Depends(require_manager)):
    return get_users(db, role)
