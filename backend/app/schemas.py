from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# ── Auth ──
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── User ──
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# ── Vendor ──
class VendorBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    performance_rating: Optional[float] = 0
    total_orders: Optional[int] = 0
    on_time_delivery: Optional[int] = 0


class VendorCreate(VendorBase):
    pass


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    performance_rating: Optional[float] = None
    total_orders: Optional[int] = None
    on_time_delivery: Optional[int] = None
    is_active: Optional[bool] = None


class VendorOut(VendorBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Product ──
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    cost_price: float = 0
    current_stock: int = 0
    threshold: int = 10
    unit: str = "pcs"
    vendor_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    current_stock: Optional[int] = None
    threshold: Optional[int] = None
    unit: Optional[str] = None
    vendor_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Bill Item ──
class BillItemCreate(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total: float


class BillItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total: float
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


# ── Bill ──
class BillCreate(BaseModel):
    biller_id: int
    biller_name: str
    customer_name: str
    customer_phone: str
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount: float = 0
    total_amount: float
    payment_method: str
    cash_received: float = 0
    change_returned: float = 0
    items: list[BillItemCreate]


class BillOut(BaseModel):
    id: int
    bill_number: str
    biller_id: int
    biller_name: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount: float
    total_amount: float
    payment_method: str
    payment_status: Optional[str] = None
    cash_received: float
    change_returned: float
    items: list[BillItemOut] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Stock Alert ──
class StockAlertOut(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    alert_type: str
    severity: str
    message: Optional[str] = None
    acknowledged: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Notification ──
class NotificationOut(BaseModel):
    id: int
    title: str
    message: Optional[str] = None
    type: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Store Settings ──
class StoreSettingsOut(BaseModel):
    id: int
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    tax_rate: float
    receipt_footer: Optional[str] = None
    upi_qr_image: Optional[str] = None

    class Config:
        from_attributes = True


class StoreSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    tax_rate: Optional[float] = None
    receipt_footer: Optional[str] = None
    upi_qr_image: Optional[str] = None


# ── Sales Chart ──
class SalesDataPoint(BaseModel):
    date: str
    sales: float
    orders: int
