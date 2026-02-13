from sqlalchemy import (
    Column, Integer, String, Boolean, Numeric, Text,
    ForeignKey, DateTime, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bills = relationship("Bill", back_populates="biller")
    notifications = relationship("Notification", back_populates="user")

    __table_args__ = (
        CheckConstraint("role IN ('manager','biller')", name="ck_users_role"),
    )


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(150))
    phone = Column(String(20))
    address = Column(Text)
    performance_rating = Column(Numeric(3, 2), default=0)
    total_orders = Column(Integer, default=0)
    on_time_delivery = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    products = relationship("Product", back_populates="vendor")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False, default=0)
    current_stock = Column(Integer, nullable=False, default=0)
    threshold = Column(Integer, nullable=False, default=10)
    unit = Column(String(30), default="pcs")
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="SET NULL"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vendor = relationship("Vendor", back_populates="products")
    bill_items = relationship("BillItem", back_populates="product")
    stock_alerts = relationship("StockAlert", back_populates="product")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(30), unique=True, nullable=False, index=True)
    biller_id = Column(Integer, ForeignKey("users.id"))
    customer_name = Column(String(150))
    customer_phone = Column(String(20))
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    tax_rate = Column(Numeric(5, 2), nullable=False, default=5)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0)
    discount = Column(Numeric(10, 2), nullable=False, default=0)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    payment_method = Column(String(20), nullable=False)
    payment_status = Column(String(20), default="completed")
    cash_received = Column(Numeric(10, 2), default=0)
    change_returned = Column(Numeric(10, 2), default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    biller = relationship("User", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("payment_method IN ('cash','upi')", name="ck_bills_payment_method"),
    )


class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)

    bill = relationship("Bill", back_populates="items")
    product = relationship("Product", back_populates="bill_items")


class StockAlert(Base):
    __tablename__ = "stock_alerts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"))
    alert_type = Column(String(30), nullable=False)
    severity = Column(String(20), nullable=False)
    message = Column(Text)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="stock_alerts")

    __table_args__ = (
        CheckConstraint("severity IN ('critical','warning','info')", name="ck_stock_alerts_severity"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    message = Column(Text)
    type = Column(String(30), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(200), default="CastPro Store")
    store_address = Column(Text)
    store_phone = Column(String(20))
    tax_rate = Column(Numeric(5, 2), default=5)
    receipt_footer = Column(Text, default="Thank you for your purchase!")
    upi_qr_image = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
