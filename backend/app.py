#!/usr/bin/env python3
"""
CastPro Backend — Single entry point.

Usage:
    python app.py                   # Runs on http://0.0.0.0:8000
    python app.py --port 9000       # Custom port
    python app.py --seed            # Seed DB then run server
    python app.py --seed-only       # Seed DB only (no server)

Connects to Supabase PostgreSQL via POSTGRES_URL env var (set automatically
by the Vercel Supabase integration). Falls back to local PostgreSQL for dev.

Environment variables (set in .env or Vercel dashboard):
    POSTGRES_URL              — Supabase Postgres connection string
    SUPABASE_URL              — Supabase project URL
    SUPABASE_SERVICE_ROLE_KEY — For admin user operations
    SUPABASE_JWT_SECRET       — For validating Supabase auth tokens
"""

import argparse
import os
import sys

# Load .env file if present (for local development)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Ensure the backend/app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def seed_database():
    """Create tables (if using SQLAlchemy models) and seed initial data."""
    from app.database import engine, Base, SessionLocal
    from app import models  # noqa: F401 — registers models with Base

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data already exists
        vendor_count = db.query(models.Vendor).count()
        if vendor_count > 0:
            print(f"Database already has {vendor_count} vendors — skipping seed.")
            return

        # ── Seed Users ──
        from app.auth import hash_password

        users = [
            models.User(
                name="Store Manager",
                email="manager@castpro.com",
                password_hash=hash_password("manager123"),
                role="manager",
            ),
            models.User(
                name="Biller One",
                email="biller1@castpro.com",
                password_hash=hash_password("biller123"),
                role="biller",
            ),
            models.User(
                name="Biller Two",
                email="biller2@castpro.com",
                password_hash=hash_password("biller123"),
                role="biller",
            ),
        ]
        db.add_all(users)
        db.flush()

        # ── Seed Vendors ──
        vendors = [
            models.Vendor(name="Fresh Farms Ltd", contact_person="Rajesh Kumar", email="fresh@farms.com", phone="9876543210", address="12 Market Road, Delhi", performance_rating=4.5, total_orders=150, on_time_delivery=140),
            models.Vendor(name="Dairy Best Co", contact_person="Anita Sharma", email="info@dairybest.com", phone="9876543211", address="45 Milk Lane, Mumbai", performance_rating=4.2, total_orders=200, on_time_delivery=180),
            models.Vendor(name="Grain Masters", contact_person="Suresh Patel", email="sales@grainmasters.com", phone="9876543212", address="78 Wheat Street, Punjab", performance_rating=3.8, total_orders=120, on_time_delivery=100),
            models.Vendor(name="Spice World", contact_person="Meena Nair", email="contact@spiceworld.com", phone="9876543213", address="23 Spice Market, Kerala", performance_rating=4.7, total_orders=90, on_time_delivery=87),
            models.Vendor(name="BevCo Distributors", contact_person="Kiran Reddy", email="orders@bevco.com", phone="9876543214", address="56 Industrial Area, Bangalore", performance_rating=4.0, total_orders=175, on_time_delivery=160),
        ]
        db.add_all(vendors)
        db.flush()

        # ── Seed Products ──
        products = [
            models.Product(name="Basmati Rice 5kg", sku="GRN-001", category="Grains", price=320, cost_price=250, current_stock=85, threshold=20, unit="bag", vendor_id=vendors[2].id),
            models.Product(name="Toor Dal 1kg", sku="GRN-002", category="Grains", price=140, cost_price=105, current_stock=120, threshold=25, unit="bag", vendor_id=vendors[2].id),
            models.Product(name="Amul Butter 500g", sku="DRY-001", category="Dairy", price=270, cost_price=220, current_stock=45, threshold=15, unit="pcs", vendor_id=vendors[1].id),
            models.Product(name="Fresh Milk 1L", sku="DRY-002", category="Dairy", price=60, cost_price=48, current_stock=200, threshold=50, unit="pcs", vendor_id=vendors[1].id),
            models.Product(name="Paneer 200g", sku="DRY-003", category="Dairy", price=90, cost_price=70, current_stock=8, threshold=15, unit="pcs", vendor_id=vendors[1].id),
            models.Product(name="Tomatoes 1kg", sku="VEG-001", category="Vegetables", price=40, cost_price=28, current_stock=150, threshold=30, unit="kg", vendor_id=vendors[0].id),
            models.Product(name="Onions 1kg", sku="VEG-002", category="Vegetables", price=35, cost_price=22, current_stock=180, threshold=30, unit="kg", vendor_id=vendors[0].id),
            models.Product(name="Potatoes 1kg", sku="VEG-003", category="Vegetables", price=30, cost_price=20, current_stock=160, threshold=30, unit="kg", vendor_id=vendors[0].id),
            models.Product(name="Red Chilli Powder 100g", sku="SPC-001", category="Spices", price=55, cost_price=35, current_stock=90, threshold=20, unit="pcs", vendor_id=vendors[3].id),
            models.Product(name="Turmeric Powder 100g", sku="SPC-002", category="Spices", price=45, cost_price=30, current_stock=95, threshold=20, unit="pcs", vendor_id=vendors[3].id),
            models.Product(name="Garam Masala 50g", sku="SPC-003", category="Spices", price=65, cost_price=42, current_stock=5, threshold=10, unit="pcs", vendor_id=vendors[3].id),
            models.Product(name="Coca Cola 750ml", sku="BEV-001", category="Beverages", price=40, cost_price=32, current_stock=100, threshold=25, unit="bottle", vendor_id=vendors[4].id),
            models.Product(name="Pepsi 750ml", sku="BEV-002", category="Beverages", price=40, cost_price=32, current_stock=95, threshold=25, unit="bottle", vendor_id=vendors[4].id),
            models.Product(name="Mineral Water 1L", sku="BEV-003", category="Beverages", price=20, cost_price=12, current_stock=250, threshold=50, unit="bottle", vendor_id=vendors[4].id),
            models.Product(name="Atta Wheat 10kg", sku="GRN-003", category="Grains", price=420, cost_price=340, current_stock=60, threshold=15, unit="bag", vendor_id=vendors[2].id),
        ]
        db.add_all(products)
        db.flush()

        # ── Seed Stock Alerts ──
        alerts = [
            models.StockAlert(product_id=products[4].id, alert_type="low_stock", severity="critical", message="Paneer 200g stock is critically low (8 units, min: 15)"),
            models.StockAlert(product_id=products[10].id, alert_type="low_stock", severity="critical", message="Garam Masala 50g stock is critically low (5 units, min: 10)"),
            models.StockAlert(product_id=products[2].id, alert_type="low_stock", severity="warning", message="Amul Butter 500g stock is running low (45 units, min: 15)"),
            models.StockAlert(product_id=products[0].id, alert_type="low_stock", severity="info", message="Basmati Rice 5kg approaching reorder level (85 units, min: 20)"),
        ]
        db.add_all(alerts)

        # ── Seed Store Settings ──
        store = models.StoreSettings(
            store_name="CastPro Store",
            store_address="123 Main Street, Hyderabad",
            store_phone="040-12345678",
            tax_rate=5.0,
            receipt_footer="Thank you for shopping with us!",
        )
        db.add(store)

        # ── Seed Notifications ──
        notifications = [
            models.Notification(user_id=users[0].id, title="Welcome to CastPro", message="Your store management system is ready.", type="info"),
            models.Notification(user_id=users[0].id, title="Low Stock Alert", message="2 products are critically low on stock.", type="warning"),
            models.Notification(user_id=users[1].id, title="Welcome", message="You have been added as a biller.", type="info"),
        ]
        db.add_all(notifications)

        db.commit()
        print(f"Database seeded successfully!")
        print(f"  Users:        {len(users)}")
        print(f"  Vendors:      {len(vendors)}")
        print(f"  Products:     {len(products)}")
        print(f"  Stock Alerts: {len(alerts)}")
        print(f"  Notifications:{len(notifications)}")
        print(f"\n  Login credentials:")
        print(f"    Manager: manager@castpro.com / manager123")
        print(f"    Biller:  biller1@castpro.com / biller123")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
        raise
    finally:
        db.close()


def seed_sales_history():
    """Generate 60 days of realistic sales history for Prophet forecasting."""
    import random
    from datetime import datetime, timedelta, timezone
    from app.database import SessionLocal
    from app import models

    db = SessionLocal()
    try:
        # Check if we already have historical bills
        bill_count = db.query(models.Bill).count()
        if bill_count > 5:
            print(f"Already have {bill_count} bills — skipping sales history seed.")
            return

        products = db.query(models.Product).filter(models.Product.is_active == True).all()
        users = db.query(models.User).filter(models.User.role == "biller").all()
        if not products or not users:
            print("No products or billers found. Run --seed first.")
            return

        now = datetime.now(timezone.utc)
        total_bills = 0
        total_items = 0

        for day_offset in range(60, 0, -1):
            date = now - timedelta(days=day_offset)
            weekday = date.weekday()

            # More bills on weekends
            if weekday >= 5:
                num_bills = random.randint(8, 15)
            else:
                num_bills = random.randint(4, 10)

            # Growth trend: more recent days have slightly more sales
            growth = 1 + (60 - day_offset) * 0.005
            num_bills = int(num_bills * growth)

            for b in range(num_bills):
                biller = random.choice(users)
                bill_number = f"BILL-{date.strftime('%Y%m%d')}-{b + 1:03d}"

                # Random items per bill (1-5)
                num_items = random.randint(1, 5)
                selected = random.sample(products, min(num_items, len(products)))

                subtotal = 0
                items = []
                for prod in selected:
                    qty = random.randint(1, 4)
                    item_total = float(prod.price) * qty
                    subtotal += item_total
                    items.append(models.BillItem(
                        product_id=prod.id,
                        quantity=qty,
                        unit_price=float(prod.price),
                        total=item_total,
                    ))

                tax_rate = 5.0
                tax_amount = round(subtotal * tax_rate / 100, 2)
                total = round(subtotal + tax_amount, 2)
                payment = random.choice(["cash", "upi"])

                bill = models.Bill(
                    bill_number=bill_number,
                    biller_id=biller.id,
                    customer_name=f"Customer {random.randint(100, 999)}",
                    customer_phone=f"98{random.randint(10000000, 99999999)}",
                    subtotal=subtotal,
                    tax_rate=tax_rate,
                    tax_amount=tax_amount,
                    discount=0,
                    total_amount=total,
                    payment_method=payment,
                    payment_status="completed",
                    cash_received=total if payment == "cash" else 0,
                    change_returned=0,
                    created_at=date.replace(
                        hour=random.randint(9, 21),
                        minute=random.randint(0, 59),
                    ),
                )
                bill.items = items
                db.add(bill)
                total_bills += 1
                total_items += len(items)

        db.commit()
        print(f"Sales history seeded!")
        print(f"  Days:       60")
        print(f"  Bills:      {total_bills}")
        print(f"  Bill Items: {total_items}")

    except Exception as e:
        db.rollback()
        print(f"Sales history seed error: {e}")
        raise
    finally:
        db.close()


def create_app():
    """Create and configure the FastAPI application."""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app.config import settings
    from app.database import engine, Base
    from app.routes import (
        auth_routes,
        vendor_routes,
        product_routes,
        bill_routes,
        alert_routes,
        settings_routes,
        forecast_routes,
    )

    # Create tables on startup (safe — uses IF NOT EXISTS internally)
    Base.metadata.create_all(bind=engine)

    api = FastAPI(
        title="CastPro API",
        version="2.0.0",
        description="CastPro Supermarket Management — FastAPI backend connected to Supabase PostgreSQL",
    )

    # CORS
    api.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount all routers
    api.include_router(auth_routes.router, prefix="/api")
    api.include_router(vendor_routes.router, prefix="/api")
    api.include_router(product_routes.router, prefix="/api")
    api.include_router(bill_routes.router, prefix="/api")
    api.include_router(alert_routes.router, prefix="/api")
    api.include_router(settings_routes.router, prefix="/api")
    api.include_router(forecast_routes.router, prefix="/api")

    @api.get("/api/health")
    def health():
        db_status = "unknown"
        try:
            from app.database import SessionLocal
            db = SessionLocal()
            db.execute(__import__("sqlalchemy").text("SELECT 1"))
            db.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {e}"

        return {
            "status": "ok",
            "service": "CastPro API",
            "version": "2.0.0",
            "database": db_status,
        }

    return api


# The application instance (used by `uvicorn app:app`)
app = create_app()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CastPro Backend Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run on (default: 8000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to bind (default: 0.0.0.0)")
    parser.add_argument("--seed", action="store_true", help="Seed database before starting server")
    parser.add_argument("--seed-only", action="store_true", help="Seed database only (no server)")
    parser.add_argument("--seed-sales", action="store_true", help="Also seed 60 days of sales history")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    args = parser.parse_args()

    if args.seed or args.seed_only:
        seed_database()
        if args.seed_sales:
            seed_sales_history()
        if args.seed_only:
            sys.exit(0)

    import uvicorn

    print(f"\n{'='*50}")
    print(f"  CastPro API Server v2.0.0")
    print(f"  Running on http://{args.host}:{args.port}")
    print(f"  Swagger docs: http://localhost:{args.port}/docs")
    print(f"  Database: {'Supabase' if 'supabase' in settings.DATABASE_URL else 'Local PostgreSQL'}")
    print(f"{'='*50}\n")

    uvicorn.run(
        "app:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
    )
