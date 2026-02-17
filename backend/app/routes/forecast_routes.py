"""
Forecast API routes.
All endpoints are under /api/forecast/...
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import forecast_service

router = APIRouter(prefix="/forecast", tags=["Forecast"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/product/{product_id}")
def forecast_product(
    product_id: int,
    days: int = Query(default=14, ge=1, le=60),
    retrain: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """
    Get Prophet forecast for a specific product.
    Returns historical actuals + future predictions with confidence intervals.
    """
    result = forecast_service.get_product_forecast(
        db, product_id, forecast_days=days, force_retrain=retrain
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return result


@router.get("/categories")
def forecast_categories(db: Session = Depends(get_db)):
    """
    Get aggregated category-level demand forecasts.
    Compares last 7 days actual vs next 7 days predicted.
    """
    return forecast_service.get_category_forecasts(db)


@router.get("/accuracy")
def forecast_accuracy(db: Session = Depends(get_db)):
    """
    Get overall model accuracy metrics (MAPE, RMSE, R-squared)
    averaged across all product models.
    """
    return forecast_service.get_forecast_accuracy(db)


@router.get("/products")
def forecast_all_products(
    days: int = Query(default=14, ge=1, le=60),
    db: Session = Depends(get_db),
):
    """
    Get list of all forecastable products with their product_id and name.
    Useful for building dropdown selectors in the frontend.
    """
    from .. import models

    products = (
        db.query(models.Product)
        .filter(models.Product.is_active == True)
        .order_by(models.Product.name)
        .all()
    )
    return [{"id": p.id, "name": p.name, "category": p.category} for p in products]
