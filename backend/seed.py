"""
Seed the CastPro database with demo data.
Run: python seed.py
"""
from app.database import SessionLocal, engine, Base
from app.models import User, Vendor, Product, Bill, BillItem, StockAlert, Notification, StoreSettings
from app.auth import hash_password

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Clear existing data (in reverse dependency order)
    db.query(BillItem).delete()
    db.query(Bill).delete()
    db.query(StockAlert).delete()
    db.query(Notification).delete()
    db.query(Product).delete()
    db.query(Vendor).delete()
    db.query(User).delete()
    db.query(StoreSettings).delete()
    db.commit()

    # ── Store Settings ──
    settings = StoreSettings(
        store_name="CastPro Store",
        store_address="123 Market Street, Mumbai 400001",
        store_phone="+91 98765 43210",
        tax_rate=5.00,
        receipt_footer="Thank you for shopping with CastPro!",
    )
    db.add(settings)

    # ── Users (passwords are bcrypt-hashed) ──
    users = [
        User(name="Rahul Sharma", email="manager@castpro.com", password_hash=hash_password("manager123"), role="manager"),
        User(name="Priya Patel", email="biller@castpro.com", password_hash=hash_password("biller123"), role="biller"),
        User(name="Amit Singh", email="biller2@castpro.com", password_hash=hash_password("biller123"), role="biller"),
    ]
    db.add_all(users)
    db.flush()

    # ── Vendors ──
    vendors = [
        Vendor(name="Fresh Farms Ltd", contact_person="Suresh Kumar", email="suresh@freshfarms.com", phone="+91 99887 76655", address="Pune, Maharashtra", performance_rating=4.5, total_orders=120, on_time_delivery=108),
        Vendor(name="Spice World Inc", contact_person="Meena Reddy", email="meena@spiceworld.com", phone="+91 98765 11223", address="Hyderabad, Telangana", performance_rating=4.2, total_orders=95, on_time_delivery=80),
        Vendor(name="Daily Essentials", contact_person="Ravi Gupta", email="ravi@dailyessentials.com", phone="+91 91234 56789", address="Delhi NCR", performance_rating=3.8, total_orders=78, on_time_delivery=62),
        Vendor(name="Premium Goods Co", contact_person="Anita Desai", email="anita@premiumgoods.com", phone="+91 88776 65544", address="Mumbai, Maharashtra", performance_rating=4.7, total_orders=150, on_time_delivery=142),
        Vendor(name="Green Valley Agro", contact_person="Vikram Joshi", email="vikram@greenvalley.com", phone="+91 77665 54433", address="Nashik, Maharashtra", performance_rating=3.5, total_orders=60, on_time_delivery=45),
    ]
    db.add_all(vendors)
    db.flush()

    # ── Products ──
    products = [
        Product(name="Basmati Rice 5kg", sku="GRN-001", category="Grains", price=320, cost_price=260, current_stock=45, threshold=20, unit="bag", vendor_id=vendors[0].id),
        Product(name="Toor Dal 1kg", sku="GRN-002", category="Grains", price=140, cost_price=105, current_stock=8, threshold=15, unit="kg", vendor_id=vendors[0].id),
        Product(name="Wheat Flour 10kg", sku="GRN-003", category="Grains", price=420, cost_price=340, current_stock=32, threshold=10, unit="bag", vendor_id=vendors[0].id),
        Product(name="Turmeric Powder 200g", sku="SPC-001", category="Spices", price=55, cost_price=38, current_stock=60, threshold=25, unit="pcs", vendor_id=vendors[1].id),
        Product(name="Red Chilli Powder 1kg", sku="SPC-002", category="Spices", price=180, cost_price=130, current_stock=3, threshold=10, unit="kg", vendor_id=vendors[1].id),
        Product(name="Cumin Seeds 500g", sku="SPC-003", category="Spices", price=120, cost_price=85, current_stock=40, threshold=15, unit="pcs", vendor_id=vendors[1].id),
        Product(name="Sunflower Oil 5L", sku="OIL-001", category="Oils", price=650, cost_price=520, current_stock=18, threshold=12, unit="can", vendor_id=vendors[2].id),
        Product(name="Mustard Oil 1L", sku="OIL-002", category="Oils", price=190, cost_price=145, current_stock=55, threshold=20, unit="btl", vendor_id=vendors[2].id),
        Product(name="Sugar 5kg", sku="ESS-001", category="Essentials", price=240, cost_price=195, current_stock=28, threshold=15, unit="bag", vendor_id=vendors[2].id),
        Product(name="Salt 1kg", sku="ESS-002", category="Essentials", price=25, cost_price=18, current_stock=100, threshold=30, unit="pcs", vendor_id=vendors[3].id),
        Product(name="Tea Leaves 500g", sku="BEV-001", category="Beverages", price=250, cost_price=185, current_stock=22, threshold=10, unit="pcs", vendor_id=vendors[3].id),
        Product(name="Coffee Powder 200g", sku="BEV-002", category="Beverages", price=320, cost_price=240, current_stock=15, threshold=8, unit="pcs", vendor_id=vendors[3].id),
        Product(name="Washing Powder 1kg", sku="CLN-001", category="Cleaning", price=165, cost_price=120, current_stock=35, threshold=12, unit="pcs", vendor_id=vendors[2].id),
        Product(name="Dish Soap 500ml", sku="CLN-002", category="Cleaning", price=85, cost_price=58, current_stock=48, threshold=20, unit="btl", vendor_id=vendors[2].id),
        Product(name="Milk Powder 500g", sku="DRY-001", category="Dairy", price=280, cost_price=210, current_stock=5, threshold=10, unit="pcs", vendor_id=vendors[0].id),
    ]
    db.add_all(products)
    db.flush()

    # ── Sample Bills ──
    biller = users[1]  # Priya Patel

    bill1 = Bill(bill_number="BILL-20260201-001", biller_id=biller.id, customer_name="Ajay Kumar", customer_phone="+91 9876500001", subtotal=990, tax_rate=5, tax_amount=49.50, discount=0, total_amount=1039.50, payment_method="cash", cash_received=1100, change_returned=60.50)
    db.add(bill1)
    db.flush()
    db.add_all([
        BillItem(bill_id=bill1.id, product_id=products[0].id, quantity=2, unit_price=320, total=640),
        BillItem(bill_id=bill1.id, product_id=products[3].id, quantity=2, unit_price=55, total=110),
        BillItem(bill_id=bill1.id, product_id=products[7].id, quantity=1, unit_price=190, total=190),
        BillItem(bill_id=bill1.id, product_id=products[9].id, quantity=1, unit_price=25, total=50),
    ])

    bill2 = Bill(bill_number="BILL-20260201-002", biller_id=biller.id, customer_name="Sunita Devi", customer_phone="+91 9876500002", subtotal=575, tax_rate=5, tax_amount=28.75, discount=0, total_amount=603.75, payment_method="upi", cash_received=0, change_returned=0)
    db.add(bill2)
    db.flush()
    db.add_all([
        BillItem(bill_id=bill2.id, product_id=products[8].id, quantity=1, unit_price=240, total=240),
        BillItem(bill_id=bill2.id, product_id=products[10].id, quantity=1, unit_price=250, total=250),
        BillItem(bill_id=bill2.id, product_id=products[13].id, quantity=1, unit_price=85, total=85),
    ])

    bill3 = Bill(bill_number="BILL-20260202-001", biller_id=users[2].id, customer_name="Manoj Tiwari", customer_phone="+91 9876500003", subtotal=1475, tax_rate=5, tax_amount=73.75, discount=50, total_amount=1498.75, payment_method="cash", cash_received=1500, change_returned=1.25)
    db.add(bill3)
    db.flush()
    db.add_all([
        BillItem(bill_id=bill3.id, product_id=products[6].id, quantity=1, unit_price=650, total=650),
        BillItem(bill_id=bill3.id, product_id=products[2].id, quantity=1, unit_price=420, total=420),
        BillItem(bill_id=bill3.id, product_id=products[5].id, quantity=2, unit_price=120, total=240),
        BillItem(bill_id=bill3.id, product_id=products[12].id, quantity=1, unit_price=165, total=165),
    ])

    # ── Stock Alerts ──
    alerts = [
        StockAlert(product_id=products[1].id, alert_type="low_stock", severity="critical", message="Toor Dal 1kg stock is critically low (8 remaining, threshold 15)"),
        StockAlert(product_id=products[4].id, alert_type="low_stock", severity="critical", message="Red Chilli Powder 1kg stock is critically low (3 remaining, threshold 10)"),
        StockAlert(product_id=products[14].id, alert_type="low_stock", severity="critical", message="Milk Powder 500g stock is critically low (5 remaining, threshold 10)"),
        StockAlert(product_id=products[6].id, alert_type="low_stock", severity="warning", message="Sunflower Oil 5L stock is running low (18 remaining, threshold 12)"),
        StockAlert(product_id=products[11].id, alert_type="low_stock", severity="warning", message="Coffee Powder 200g stock is nearing threshold (15 remaining, threshold 8)", acknowledged=True),
        StockAlert(product_id=products[0].id, alert_type="forecast", severity="info", message="Basmati Rice 5kg demand expected to increase 20% next month"),
    ]
    db.add_all(alerts)

    # ── Notifications ──
    notifs = [
        Notification(user_id=users[0].id, title="Critical Stock Alert", message="Red Chilli Powder 1kg is critically low (3 units)", type="error"),
        Notification(user_id=users[0].id, title="New Bill Created", message="Bill #BILL-20260201-001 created by Priya Patel", type="success"),
        Notification(user_id=users[0].id, title="Vendor Rating Updated", message="Premium Goods Co rating updated to 4.7", type="info", is_read=True),
        Notification(user_id=users[0].id, title="Forecast Ready", message="February demand forecast is available for review", type="info", is_read=True),
    ]
    db.add_all(notifs)

    db.commit()
    print("Database seeded successfully!")
    print("  Users: 3 (manager + 2 billers)")
    print("  Vendors: 5")
    print("  Products: 15")
    print("  Bills: 3")
    print("  Stock Alerts: 6")
    print("  Notifications: 4")

except Exception as e:
    db.rollback()
    print(f"Error seeding database: {e}")
    raise
finally:
    db.close()
