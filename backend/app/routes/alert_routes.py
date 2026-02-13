from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import StockAlertOut
from ..crud import get_stock_alerts, acknowledge_alert, auto_generate_alerts
from ..auth import get_current_user, require_manager
from ..models import User

router = APIRouter(prefix="/stock-alerts", tags=["Stock Alerts"])


@router.get("", response_model=list[StockAlertOut])
def list_alerts(severity: str | None = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    alerts = get_stock_alerts(db, severity)
    result = []
    for a in alerts:
        result.append(StockAlertOut(
            id=a.id,
            product_id=a.product_id,
            product_name=a.product.name if a.product else None,
            alert_type=a.alert_type,
            severity=a.severity,
            message=a.message,
            acknowledged=a.acknowledged,
            created_at=a.created_at,
        ))
    return result


@router.put("/{alert_id}/acknowledge")
def ack_alert(alert_id: int, db: Session = Depends(get_db), user: User = Depends(require_manager)):
    acknowledge_alert(db, alert_id, user.id)
    return {"ok": True}


@router.post("/generate")
def generate_alerts(db: Session = Depends(get_db), _=Depends(require_manager)):
    new_alerts = auto_generate_alerts(db)
    return {"generated": len(new_alerts)}
