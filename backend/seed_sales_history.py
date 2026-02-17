"""
Seed 60 days of realistic sales history into the database.
This creates enough data for Prophet to train meaningful forecasts.

Run AFTER seed.py:
    python seed_sales_history.py
"""
import random
import math
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal, engine, Base
from app.models import Bill, BillItem, Product, User

random.seed(42)  # reproducible

db = SessionLocal()

try:
    # Fetch biller users and products
    billers = db.query(User).filter(User.role == "biller", User.is_active == True).all()
    products = db.query(Product).filter(Product.is_active == True).all()

    if not billers or not products:
        print("ERROR: Run seed.py first to create users and products.")
        exit(1)

    # Base daily demand per product (units/day on average)
    base_demand = {}
    for p in products:
        if "Rice" in p.name:
            base_demand[p.id] = 8
        elif "Dal" in p.name:
            base_demand[p.id] = 6
        elif "Oil" in p.name and "5L" in p.name:
            base_demand[p.id] = 3
        elif "Oil" in p.name:
            base_demand[p.id] = 5
        elif "Sugar" in p.name:
            base_demand[p.id] = 7
        elif "Salt" in p.name:
            base_demand[p.id] = 10
        elif "Tea" in p.name:
            base_demand[p.id] = 5
        elif "Coffee" in p.name:
            base_demand[p.id] = 3
        elif "Chilli" in p.name:
            base_demand[p.id] = 4
        elif "Turmeric" in p.name:
            base_demand[p.id] = 6
        elif "Cumin" in p.name:
            base_demand[p.id] = 4
        elif "Flour" in p.name:
            base_demand[p.id] = 5
        elif "Washing" in p.name:
            base_demand[p.id] = 3
        elif "Dish" in p.name:
            base_demand[p.id] = 4
        elif "Milk" in p.name:
            base_demand[p.id] = 3
        else:
            base_demand[p.id] = 4

    product_map = {p.id: p for p in products}
    today = datetime.now(timezone.utc).replace(hour=12, minute=0, second=0, microsecond=0)

    total_bills = 0
    total_items = 0

    # Generate 60 days of sales history
    for day_offset in range(60, 0, -1):
        sale_date = today - timedelta(days=day_offset)
        day_of_week = sale_date.weekday()  # 0=Mon, 6=Sun

        # Weekend multiplier (more sales on weekends)
        weekend_mult = 1.3 if day_of_week >= 5 else 1.0

        # Weekly seasonality: dip on Tuesdays, peak on Saturdays
        weekly_seasonal = 1.0 + 0.15 * math.sin(2 * math.pi * day_of_week / 7)

        # Monthly trend: slight upward trend over 60 days
        trend = 1.0 + (60 - day_offset) * 0.003

        # Number of bills this day (5-15 bills per day)
        num_bills = random.randint(5, 15)
        num_bills = int(num_bills * weekend_mult)

        customer_names = [
            "Ajay Kumar", "Sunita Devi", "Manoj Tiwari", "Kavita Sharma",
            "Rajesh Patel", "Meena Gupta", "Sanjay Singh", "Priya Reddy",
            "Vikram Joshi", "Anita Desai", "Ravi Verma", "Deepa Nair",
            "Suresh Yadav", "Pooja Mishra", "Arun Saxena", "Nisha Agarwal",
        ]

        for bill_idx in range(num_bills):
            biller = random.choice(billers)
            customer = random.choice(customer_names)

            # Each bill has 1-6 items
            num_items = random.randint(1, 6)
            selected_products = random.sample(products, min(num_items, len(products)))

            bill_subtotal = 0.0
            items_data = []

            for prod in selected_products:
                # Quantity based on base demand with noise and seasonality
                base = base_demand.get(prod.id, 4)
                qty_float = base * trend * weekly_seasonal * weekend_mult
                qty_float += random.gauss(0, base * 0.3)  # gaussian noise
                qty = max(1, int(round(qty_float / num_bills)))  # split across bills
                qty = min(qty, 5)  # cap per-bill quantity

                unit_price = float(prod.price)
                item_total = qty * unit_price
                bill_subtotal += item_total

                items_data.append({
                    "product_id": prod.id,
                    "quantity": qty,
                    "unit_price": unit_price,
                    "total": item_total,
                })

            tax_rate = 5.0
            tax_amount = round(bill_subtotal * tax_rate / 100, 2)
            discount = round(random.choice([0, 0, 0, 0, 10, 20, 50]) * 1.0, 2)
            total_amount = round(bill_subtotal + tax_amount - discount, 2)

            payment_method = random.choice(["cash", "cash", "cash", "upi", "upi"])
            cash_received = 0.0
            change_returned = 0.0
            if payment_method == "cash":
                # Round up cash received to nearest 50 or 100
                cash_received = float(math.ceil(total_amount / 50) * 50)
                change_returned = round(cash_received - total_amount, 2)

            bill_number = f"BILL-{sale_date.strftime('%Y%m%d')}-{bill_idx + 1:03d}"

            # Randomize time within the day (9 AM to 9 PM)
            hour = random.randint(9, 21)
            minute = random.randint(0, 59)
            bill_time = sale_date.replace(hour=hour, minute=minute, second=random.randint(0, 59))

            bill = Bill(
                bill_number=bill_number,
                biller_id=biller.id,
                customer_name=customer,
                customer_phone=f"+91 98765{random.randint(10000, 99999)}",
                subtotal=round(bill_subtotal, 2),
                tax_rate=tax_rate,
                tax_amount=tax_amount,
                discount=discount,
                total_amount=total_amount,
                payment_method=payment_method,
                payment_status="completed",
                cash_received=cash_received,
                change_returned=change_returned,
                created_at=bill_time,
            )
            db.add(bill)
            db.flush()

            for item in items_data:
                db.add(BillItem(
                    bill_id=bill.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    total=item["total"],
                ))
                total_items += 1

            total_bills += 1

    db.commit()
    print(f"Sales history seeded successfully!")
    print(f"  Days:       60")
    print(f"  Bills:      {total_bills}")
    print(f"  Bill Items: {total_items}")
    print(f"  Date range: {(today - timedelta(days=60)).strftime('%Y-%m-%d')} to {(today - timedelta(days=1)).strftime('%Y-%m-%d')}")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()
