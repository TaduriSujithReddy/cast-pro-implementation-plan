"""
Prophet-based demand forecasting service.

Pulls historical sales data from bill_items, trains a Prophet model
per product, and returns predictions with real confidence intervals.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import numpy as np
import pandas as pd
from prophet import Prophet
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models

logger = logging.getLogger(__name__)

# In-memory model cache: product_id -> { model, trained_at, metrics }
_model_cache: dict[int, dict] = {}


def _get_daily_sales(db: Session, product_id: int) -> pd.DataFrame:
    """
    Query bill_items joined with bills to get daily quantity sold
    for a specific product, grouped by date.
    """
    rows = (
        db.query(
            func.date(models.Bill.created_at).label("ds"),
            func.sum(models.BillItem.quantity).label("y"),
        )
        .join(models.Bill, models.BillItem.bill_id == models.Bill.id)
        .filter(models.BillItem.product_id == product_id)
        .group_by(func.date(models.Bill.created_at))
        .order_by(func.date(models.Bill.created_at))
        .all()
    )

    if not rows:
        return pd.DataFrame(columns=["ds", "y"])

    df = pd.DataFrame([{"ds": r.ds, "y": float(r.y)} for r in rows])
    df["ds"] = pd.to_datetime(df["ds"])

    # Fill missing dates with 0 (no sales that day)
    if len(df) > 1:
        date_range = pd.date_range(start=df["ds"].min(), end=df["ds"].max(), freq="D")
        df = df.set_index("ds").reindex(date_range, fill_value=0).reset_index()
        df.columns = ["ds", "y"]

    return df


def _train_prophet(df: pd.DataFrame) -> tuple[Prophet, dict]:
    """
    Train a Prophet model on the given daily sales dataframe.
    Returns the fitted model and accuracy metrics computed via
    a holdout of the last 7 days.
    """
    metrics = {"mape": 0, "rmse": 0, "r2": 0}

    # Split: train on all but last 7 days, test on last 7
    if len(df) > 14:
        train_df = df.iloc[:-7].copy()
        test_df = df.iloc[-7:].copy()
    else:
        train_df = df.copy()
        test_df = None

    # Configure Prophet
    model = Prophet(
        yearly_seasonality=False,     # not enough data for yearly
        weekly_seasonality=True,      # capture day-of-week patterns
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.05, # conservative trend changes
        interval_width=0.80,          # 80% confidence interval
    )

    # Suppress Prophet's verbose logging
    model.fit(train_df)

    # Evaluate on holdout
    if test_df is not None and len(test_df) > 0:
        future_test = model.make_future_dataframe(periods=7, include_history=False)
        # Align future_test dates with test_df
        forecast_test = model.predict(future_test)
        y_true = test_df["y"].values
        y_pred = forecast_test["yhat"].values[: len(y_true)]

        # Ensure non-negative predictions
        y_pred = np.maximum(y_pred, 0)

        if len(y_true) > 0 and np.any(y_true > 0):
            # Filter out zeros for MAPE (avoid division by zero)
            mask = y_true > 0
            if np.any(mask):
                metrics["mape"] = round(
                    mean_absolute_percentage_error(y_true[mask], y_pred[mask]) * 100, 1
                )
            metrics["rmse"] = round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 2)

            # R-squared
            ss_res = np.sum((y_true - y_pred) ** 2)
            ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
            metrics["r2"] = round(1 - ss_res / ss_tot, 3) if ss_tot > 0 else 0

    return model, metrics


def get_product_forecast(
    db: Session,
    product_id: int,
    forecast_days: int = 14,
    force_retrain: bool = False,
) -> Optional[dict]:
    """
    Get forecast for a specific product. Returns:
    {
        "product_id": int,
        "product_name": str,
        "data": [ { date, actual, predicted, lower, upper } ],
        "metrics": { mape, rmse, r2 },
        "trained_at": str,
    }
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return None

    # Check cache (retrain every 6 hours or on force)
    cached = _model_cache.get(product_id)
    now = datetime.now(timezone.utc)
    if (
        cached
        and not force_retrain
        and (now - cached["trained_at"]).total_seconds() < 6 * 3600
    ):
        # Rebuild response from cached model
        model = cached["model"]
        metrics = cached["metrics"]
        df = cached["df"]
    else:
        # Get historical data
        df = _get_daily_sales(db, product_id)
        if len(df) < 7:
            return {
                "product_id": product_id,
                "product_name": product.name,
                "data": [],
                "metrics": {"mape": 0, "rmse": 0, "r2": 0},
                "trained_at": now.isoformat(),
                "error": "Insufficient data. Need at least 7 days of sales history.",
            }

        model, metrics = _train_prophet(df)
        _model_cache[product_id] = {
            "model": model,
            "metrics": metrics,
            "df": df,
            "trained_at": now,
        }

    # Generate future predictions
    future = model.make_future_dataframe(periods=forecast_days, include_history=True)
    forecast = model.predict(future)

    # Merge actual data with predictions
    actual_map = dict(zip(df["ds"].dt.strftime("%Y-%m-%d"), df["y"]))
    result_data = []
    for _, row in forecast.iterrows():
        date_str = row["ds"].strftime("%Y-%m-%d")
        actual_val = actual_map.get(date_str)

        result_data.append({
            "date": date_str,
            "actual": round(actual_val, 1) if actual_val is not None else None,
            "predicted": round(max(0, row["yhat"]), 1),
            "lower": round(max(0, row["yhat_lower"]), 1),
            "upper": round(max(0, row["yhat_upper"]), 1),
        })

    return {
        "product_id": product_id,
        "product_name": product.name,
        "data": result_data,
        "metrics": metrics,
        "trained_at": now.strftime("%Y-%m-%d"),
    }


def get_category_forecasts(db: Session) -> list[dict]:
    """
    Aggregate forecast data at category level. Compares total sales of
    the last 7 days vs predicted next 7 days for each category.
    """
    categories = (
        db.query(models.Product.category)
        .filter(models.Product.is_active == True)
        .distinct()
        .all()
    )

    now = datetime.now(timezone.utc)
    last_7_start = now - timedelta(days=7)
    results = []

    for (category,) in categories:
        # Get product IDs in this category
        product_ids = [
            p.id
            for p in db.query(models.Product)
            .filter(models.Product.category == category, models.Product.is_active == True)
            .all()
        ]

        if not product_ids:
            continue

        # Actual sales last 7 days
        actual_sales = (
            db.query(func.coalesce(func.sum(models.BillItem.quantity), 0))
            .join(models.Bill, models.BillItem.bill_id == models.Bill.id)
            .filter(
                models.BillItem.product_id.in_(product_ids),
                models.Bill.created_at >= last_7_start,
            )
            .scalar()
        )
        current_demand = int(actual_sales or 0)

        # Predict next 7 days: sum individual product forecasts
        predicted_total = 0
        confidence_scores = []
        for pid in product_ids:
            forecast = get_product_forecast(db, pid, forecast_days=7)
            if forecast and forecast["data"]:
                future_points = [p for p in forecast["data"] if p["actual"] is None]
                predicted_total += sum(p["predicted"] for p in future_points)
                if forecast["metrics"]["r2"] > 0:
                    confidence_scores.append(max(0, min(100, forecast["metrics"]["r2"] * 100)))

        predicted_demand = int(round(predicted_total))
        change = round(
            ((predicted_demand - current_demand) / max(current_demand, 1)) * 100, 1
        )
        confidence = round(sum(confidence_scores) / max(len(confidence_scores), 1), 0)

        results.append({
            "category": category,
            "currentDemand": current_demand,
            "predictedDemand": predicted_demand,
            "changePercent": change,
            "confidence": int(confidence),
        })

    results.sort(key=lambda x: x["category"])
    return results


def get_forecast_accuracy(db: Session) -> dict:
    """
    Get overall model accuracy metrics averaged across all products
    that have been trained.
    """
    if not _model_cache:
        # Train all products if cache is empty
        products = (
            db.query(models.Product)
            .filter(models.Product.is_active == True)
            .all()
        )
        for p in products:
            get_product_forecast(db, p.id)

    if not _model_cache:
        return {"mape": 0, "rmse": 0, "r2": 0, "lastTrained": "N/A", "productsModeled": 0}

    mapes = [c["metrics"]["mape"] for c in _model_cache.values() if c["metrics"]["mape"] > 0]
    rmses = [c["metrics"]["rmse"] for c in _model_cache.values() if c["metrics"]["rmse"] > 0]
    r2s = [c["metrics"]["r2"] for c in _model_cache.values()]

    last_trained = max(c["trained_at"] for c in _model_cache.values())

    return {
        "mape": round(sum(mapes) / max(len(mapes), 1), 1),
        "rmse": round(sum(rmses) / max(len(rmses), 1), 2),
        "r2": round(sum(r2s) / max(len(r2s), 1), 3),
        "lastTrained": last_trained.strftime("%Y-%m-%d"),
        "productsModeled": len(_model_cache),
    }
