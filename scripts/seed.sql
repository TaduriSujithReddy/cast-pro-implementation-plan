-- CastPro Seed Data
-- Passwords: manager123 / biller123 (bcrypt-hashed for production)
-- For demo, plain text is used in the mock layer; hash before production use.

INSERT INTO store_settings (store_name, store_address, store_phone, tax_rate, receipt_footer)
VALUES ('CastPro Store', '123 Market Street, Mumbai 400001', '+91 98765 43210', 5.00, 'Thank you for shopping with CastPro!');

INSERT INTO users (name, email, password_hash, role) VALUES
('Rahul Sharma',  'manager@castpro.com', 'manager123', 'manager'),
('Priya Patel',   'biller@castpro.com',  'biller123',  'biller'),
('Amit Singh',    'biller2@castpro.com',  'biller123',  'biller');

INSERT INTO vendors (name, contact_person, email, phone, address, performance_rating, total_orders, on_time_delivery) VALUES
('Fresh Farms Ltd',    'Suresh Kumar',  'suresh@freshfarms.com',   '+91 99887 76655', 'Pune, Maharashtra',      4.5, 120, 108),
('Spice World Inc',    'Meena Reddy',   'meena@spiceworld.com',    '+91 98765 11223', 'Hyderabad, Telangana',   4.2, 95,  80),
('Daily Essentials',   'Ravi Gupta',    'ravi@dailyessentials.com', '+91 91234 56789', 'Delhi NCR',              3.8, 78,  62),
('Premium Goods Co',   'Anita Desai',   'anita@premiumgoods.com',  '+91 88776 65544', 'Mumbai, Maharashtra',    4.7, 150, 142),
('Green Valley Agro',  'Vikram Joshi',  'vikram@greenvalley.com',  '+91 77665 54433', 'Nashik, Maharashtra',    3.5, 60,  45);

INSERT INTO products (name, sku, category, price, cost_price, current_stock, threshold, unit, vendor_id) VALUES
('Basmati Rice 5kg',     'GRN-001', 'Grains',      320.00, 260.00,  45, 20, 'bag', 1),
('Toor Dal 1kg',         'GRN-002', 'Grains',      140.00, 105.00,  8,  15, 'kg',  1),
('Wheat Flour 10kg',     'GRN-003', 'Grains',      420.00, 340.00,  32, 10, 'bag', 1),
('Turmeric Powder 200g', 'SPC-001', 'Spices',       55.00,  38.00,  60, 25, 'pcs', 2),
('Red Chilli Powder 1kg','SPC-002', 'Spices',      180.00, 130.00,  3,  10, 'kg',  2),
('Cumin Seeds 500g',     'SPC-003', 'Spices',      120.00,  85.00,  40, 15, 'pcs', 2),
('Sunflower Oil 5L',     'OIL-001', 'Oils',        650.00, 520.00,  18, 12, 'can', 3),
('Mustard Oil 1L',       'OIL-002', 'Oils',        190.00, 145.00,  55, 20, 'btl', 3),
('Sugar 5kg',            'ESS-001', 'Essentials',  240.00, 195.00,  28, 15, 'bag', 3),
('Salt 1kg',             'ESS-002', 'Essentials',   25.00,  18.00, 100, 30, 'pcs', 4),
('Tea Leaves 500g',      'BEV-001', 'Beverages',   250.00, 185.00,  22, 10, 'pcs', 4),
('Coffee Powder 200g',   'BEV-002', 'Beverages',   320.00, 240.00,  15, 8,  'pcs', 4),
('Washing Powder 1kg',   'CLN-001', 'Cleaning',    165.00, 120.00,  35, 12, 'pcs', 3),
('Dish Soap 500ml',      'CLN-002', 'Cleaning',     85.00,  58.00,  48, 20, 'btl', 3),
('Milk Powder 500g',     'DRY-001', 'Dairy',       280.00, 210.00,  5,  10, 'pcs', 1);

INSERT INTO bills (bill_number, biller_id, customer_name, customer_phone, subtotal, tax_rate, tax_amount, discount, total_amount, payment_method, cash_received, change_returned, created_at) VALUES
('BILL-20260201-001', 2, 'Ajay Kumar',    '+91 9876500001', 980.00, 5, 49.00, 0,  1029.00, 'cash', 1100.00, 71.00,  '2026-02-01 10:30:00'),
('BILL-20260201-002', 2, 'Sunita Devi',   '+91 9876500002', 550.00, 5, 27.50, 0,   577.50, 'upi',  0,       0,      '2026-02-01 14:15:00'),
('BILL-20260202-001', 3, 'Manoj Tiwari',  '+91 9876500003', 1420.00,5, 71.00, 50, 1441.00, 'cash', 1500.00, 59.00,  '2026-02-02 09:45:00'),
('BILL-20260203-001', 2, 'Kavita Sharma', '+91 9876500004', 325.00, 5, 16.25, 0,   341.25, 'upi',  0,       0,      '2026-02-03 11:00:00'),
('BILL-20260204-001', 2, 'Rajan Mehta',   '+91 9876500005', 2100.00,5,105.00, 100, 2105.00,'cash', 2200.00, 95.00,  '2026-02-04 16:20:00');

INSERT INTO stock_alerts (product_id, alert_type, severity, message) VALUES
(2,  'low_stock',  'critical', 'Toor Dal 1kg stock is critically low (8 remaining, threshold 15)'),
(5,  'low_stock',  'critical', 'Red Chilli Powder 1kg stock is critically low (3 remaining, threshold 10)'),
(15, 'low_stock',  'critical', 'Milk Powder 500g stock is critically low (5 remaining, threshold 10)'),
(7,  'low_stock',  'warning',  'Sunflower Oil 5L stock is running low (18 remaining, threshold 12)'),
(12, 'low_stock',  'warning',  'Coffee Powder 200g stock is nearing threshold (15 remaining, threshold 8)'),
(1,  'forecast',   'info',     'Basmati Rice 5kg demand expected to increase 20% next month');
