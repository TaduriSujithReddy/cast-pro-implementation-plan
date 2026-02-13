from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import ProductOut, ProductCreate, ProductUpdate
from ..crud import get_products, get_product, create_product, update_product, delete_product, get_categories
from ..auth import get_current_user, require_manager

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_products(db)


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_categories(db)


@router.get("/{product_id}", response_model=ProductOut)
def read_product(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = get_product(db, product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@router.post("", response_model=ProductOut)
def add_product(data: ProductCreate, db: Session = Depends(get_db), _=Depends(require_manager)):
    return create_product(db, data)


@router.put("/{product_id}", response_model=ProductOut)
def edit_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), _=Depends(require_manager)):
    p = update_product(db, product_id, data)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@router.delete("/{product_id}")
def remove_product(product_id: int, db: Session = Depends(get_db), _=Depends(require_manager)):
    delete_product(db, product_id)
    return {"ok": True}
