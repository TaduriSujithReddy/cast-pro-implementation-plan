from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import BillOut, BillCreate, BillItemOut
from ..crud import get_bills, get_bill, create_bill
from ..auth import get_current_user
from ..models import User

router = APIRouter(prefix="/bills", tags=["Bills"])


def _bill_to_out(bill) -> dict:
    """Convert Bill ORM object to dict with biller_name and product_name on items."""
    items = []
    for item in bill.items:
        product_name = item.product.name if item.product else f"Product #{item.product_id}"
        items.append(BillItemOut(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=float(item.unit_price),
            total=float(item.total),
            product_name=product_name,
        ))
    return BillOut(
        id=bill.id,
        bill_number=bill.bill_number,
        biller_id=bill.biller_id,
        biller_name=bill.biller.name if bill.biller else None,
        customer_name=bill.customer_name,
        customer_phone=bill.customer_phone,
        subtotal=float(bill.subtotal),
        tax_rate=float(bill.tax_rate),
        tax_amount=float(bill.tax_amount),
        discount=float(bill.discount),
        total_amount=float(bill.total_amount),
        payment_method=bill.payment_method,
        payment_status=bill.payment_status,
        cash_received=float(bill.cash_received),
        change_returned=float(bill.change_returned),
        items=items,
        created_at=bill.created_at,
    )


@router.get("", response_model=list[BillOut])
def list_bills(
    biller_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Billers can only see their own bills
    if user.role == "biller":
        biller_id = user.id
    bills = get_bills(db, biller_id)
    return [_bill_to_out(b) for b in bills]


@router.get("/{bill_id}", response_model=BillOut)
def read_bill(bill_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = get_bill(db, bill_id)
    if not b:
        raise HTTPException(status_code=404, detail="Bill not found")
    if user.role == "biller" and b.biller_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return _bill_to_out(b)


@router.post("", response_model=BillOut)
def add_bill(data: BillCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    b = create_bill(db, data)
    # Re-query to load relationships
    b = get_bill(db, b.id)
    return _bill_to_out(b)
