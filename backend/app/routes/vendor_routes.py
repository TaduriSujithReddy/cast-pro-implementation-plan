from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import VendorOut, VendorCreate, VendorUpdate
from ..crud import get_vendors, get_vendor, create_vendor, update_vendor, delete_vendor
from ..auth import get_current_user, require_manager

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("", response_model=list[VendorOut])
def list_vendors(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_vendors(db)


@router.get("/{vendor_id}", response_model=VendorOut)
def read_vendor(vendor_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    v = get_vendor(db, vendor_id)
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v


@router.post("", response_model=VendorOut)
def add_vendor(data: VendorCreate, db: Session = Depends(get_db), _=Depends(require_manager)):
    return create_vendor(db, data)


@router.put("/{vendor_id}", response_model=VendorOut)
def edit_vendor(vendor_id: int, data: VendorUpdate, db: Session = Depends(get_db), _=Depends(require_manager)):
    v = update_vendor(db, vendor_id, data)
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v


@router.delete("/{vendor_id}")
def remove_vendor(vendor_id: int, db: Session = Depends(get_db), _=Depends(require_manager)):
    delete_vendor(db, vendor_id)
    return {"ok": True}
