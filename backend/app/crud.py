from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from . import models, schemas
from .auth import hash_password


# ── Users ──
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, role: str | None = None):
    q = db.query(models.User).filter(models.User.is_active == True)
    if role:
        q = q.filter(models.User.role == role)
    return q.all()


# ── Vendors ──
def get_vendors(db: Session, active_only: bool = True):
    q = db.query(models.Vendor)
    if active_only:
        q = q.filter(models.Vendor.is_active == True)
    return q.order_by(models.Vendor.name).all()


def get_vendor(db: Session, vendor_id: int):
    return db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()


def create_vendor(db: Session, data: schemas.VendorCreate):
    vendor = models.Vendor(**data.model_dump())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor(db: Session, vendor_id: int, data: schemas.VendorUpdate):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if not vendor:
        return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(vendor, key, val)
    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor_id: int):
    vendor = db.query(models.Vendor).filter(models.Vendor.id == vendor_id).first()
    if vendor:
        vendor.is_active = False
        db.commit()
    return vendor


# ── Products ──
def get_products(db: Session, active_only: bool = True):
    q = db.query(models.Product)
    if active_only:
        q = q.filter(models.Product.is_active == True)
    return q.order_by(models.Product.name).all()


def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def create_product(db: Session, data: schemas.ProductCreate):
    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: schemas.ProductUpdate):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(product, key, val)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        product.is_active = False
        db.commit()
    return product


def get_categories(db: Session):
    rows = db.query(models.Product.category).distinct().order_by(models.Product.category).all()
    return [r[0] for r in rows]


# ── Bills ──
def get_bills(db: Session, biller_id: int | None = None):
    q = db.query(models.Bill).options(joinedload(models.Bill.items))
    if biller_id:
        q = q.filter(models.Bill.biller_id == biller_id)
    return q.order_by(models.Bill.created_at.desc()).all()


def get_bill(db: Session, bill_id: int):
    return (
        db.query(models.Bill)
        .options(joinedload(models.Bill.items))
        .filter(models.Bill.id == bill_id)
        .first()
    )


def create_bill(db: Session, data: schemas.BillCreate):
    # Generate bill number
    today = datetime.now(timezone.utc).strftime("%Y%m%d")
    count = db.query(models.Bill).filter(
        models.Bill.bill_number.like(f"BILL-{today}-%")
    ).count()
    bill_number = f"BILL-{today}-{count + 1:03d}"

    bill = models.Bill(
        bill_number=bill_number,
        biller_id=data.biller_id,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        subtotal=data.subtotal,
        tax_rate=data.tax_rate,
        tax_amount=data.tax_amount,
        discount=data.discount,
        total_amount=data.total_amount,
        payment_method=data.payment_method,
        payment_status="completed",
        cash_received=data.cash_received,
        change_returned=data.change_returned,
    )
    db.add(bill)
    db.flush()  # get bill.id

    for item in data.items:
        bill_item = models.BillItem(
            bill_id=bill.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total=item.total,
        )
        db.add(bill_item)

        # Deduct stock
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.current_stock = max(0, product.current_stock - item.quantity)

    db.commit()
    db.refresh(bill)
    return bill


# ── Stock Alerts ──
def get_stock_alerts(db: Session, severity: str | None = None):
    q = db.query(models.StockAlert).join(models.Product)
    if severity:
        q = q.filter(models.StockAlert.severity == severity)
    return q.order_by(models.StockAlert.created_at.desc()).all()


def acknowledge_alert(db: Session, alert_id: int, user_id: int):
    alert = db.query(models.StockAlert).filter(models.StockAlert.id == alert_id).first()
    if alert:
        alert.acknowledged = True
        alert.acknowledged_by = user_id
        db.commit()
        db.refresh(alert)
    return alert


def auto_generate_alerts(db: Session):
    """Check stock levels and create alerts for products below threshold."""
    products = db.query(models.Product).filter(
        models.Product.is_active == True,
        models.Product.current_stock <= models.Product.threshold,
    ).all()
    new_alerts = []
    for p in products:
        existing = db.query(models.StockAlert).filter(
            models.StockAlert.product_id == p.id,
            models.StockAlert.acknowledged == False,
        ).first()
        if existing:
            continue
        severity = "critical" if p.current_stock <= p.threshold * 0.5 else "warning"
        alert = models.StockAlert(
            product_id=p.id,
            alert_type="low_stock",
            severity=severity,
            message=f"{p.name} stock is {'critically low' if severity == 'critical' else 'running low'} "
                    f"({p.current_stock} remaining, threshold {p.threshold})",
        )
        db.add(alert)
        new_alerts.append(alert)
    db.commit()
    return new_alerts


# ── Notifications ──
def get_notifications(db: Session, user_id: int | None = None):
    q = db.query(models.Notification)
    if user_id:
        q = q.filter(models.Notification.user_id == user_id)
    return q.order_by(models.Notification.created_at.desc()).limit(20).all()


def mark_notification_read(db: Session, notification_id: int):
    n = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if n:
        n.is_read = True
        db.commit()
    return n


# ── Store Settings ──
def get_store_settings(db: Session):
    return db.query(models.StoreSettings).first()


def update_store_settings(db: Session, data: schemas.StoreSettingsUpdate):
    settings = db.query(models.StoreSettings).first()
    if not settings:
        settings = models.StoreSettings()
        db.add(settings)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(settings, key, val)
    db.commit()
    db.refresh(settings)
    return settings


# ── Sales Chart Data ──
def get_sales_chart_data(db: Session, days: int = 30):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(
            func.date(models.Bill.created_at).label("date"),
            func.sum(models.Bill.total_amount).label("sales"),
            func.count(models.Bill.id).label("orders"),
        )
        .filter(models.Bill.created_at >= start_date)
        .group_by(func.date(models.Bill.created_at))
        .order_by(func.date(models.Bill.created_at))
        .all()
    )
    return [{"date": str(r.date), "sales": float(r.sales or 0), "orders": int(r.orders)} for r in rows]
