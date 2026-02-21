-- CastPro Database Schema for Supabase
-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'biller' check (role in ('manager', 'biller')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Vendors
create table if not exists public.vendors (
  id serial primary key,
  name text not null,
  contact_person text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  performance_rating numeric(2,1) not null default 0,
  total_orders int not null default 0,
  on_time_delivery int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.vendors enable row level security;
create policy "vendors_select_all" on public.vendors for select using (true);
create policy "vendors_insert_auth" on public.vendors for insert with check (auth.uid() is not null);
create policy "vendors_update_auth" on public.vendors for update using (auth.uid() is not null);
create policy "vendors_delete_auth" on public.vendors for delete using (auth.uid() is not null);

-- Products
create table if not exists public.products (
  id serial primary key,
  name text not null,
  sku text not null unique,
  category text not null,
  price numeric(10,2) not null default 0,
  cost_price numeric(10,2) not null default 0,
  current_stock int not null default 0,
  threshold int not null default 10,
  unit text not null default 'pcs',
  vendor_id int references public.vendors(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.products enable row level security;
create policy "products_select_all" on public.products for select using (true);
create policy "products_insert_auth" on public.products for insert with check (auth.uid() is not null);
create policy "products_update_auth" on public.products for update using (auth.uid() is not null);
create policy "products_delete_auth" on public.products for delete using (auth.uid() is not null);

-- Bills
create table if not exists public.bills (
  id serial primary key,
  bill_number text not null unique,
  biller_id uuid not null references auth.users(id),
  biller_name text not null default '',
  customer_name text not null default 'Walk-in',
  customer_phone text not null default '',
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'upi')),
  cash_received numeric(10,2) default 0,
  change_returned numeric(10,2) default 0,
  created_at timestamptz default now()
);

alter table public.bills enable row level security;
create policy "bills_select_all" on public.bills for select using (true);
create policy "bills_insert_auth" on public.bills for insert with check (auth.uid() is not null);

-- Bill items
create table if not exists public.bill_items (
  id serial primary key,
  bill_id int not null references public.bills(id) on delete cascade,
  product_id int not null references public.products(id),
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null,
  total numeric(10,2) not null,
  created_at timestamptz default now()
);

alter table public.bill_items enable row level security;
create policy "bill_items_select_all" on public.bill_items for select using (true);
create policy "bill_items_insert_auth" on public.bill_items for insert with check (auth.uid() is not null);

-- Stock alerts
create table if not exists public.stock_alerts (
  id serial primary key,
  product_id int references public.products(id) on delete cascade,
  product_name text not null,
  severity text not null default 'info' check (severity in ('critical', 'warning', 'info')),
  message text not null,
  acknowledged boolean not null default false,
  created_at timestamptz default now()
);

alter table public.stock_alerts enable row level security;
create policy "stock_alerts_select_all" on public.stock_alerts for select using (true);
create policy "stock_alerts_insert_auth" on public.stock_alerts for insert with check (auth.uid() is not null);
create policy "stock_alerts_update_auth" on public.stock_alerts for update using (auth.uid() is not null);

-- Store settings (single-row config)
create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'CastPro Store',
  store_address text not null default '',
  store_phone text not null default '',
  tax_rate numeric(5,2) not null default 5.0,
  currency text not null default 'INR',
  receipt_footer text not null default 'Thank you for shopping!',
  upi_qr_image text default null
);

alter table public.store_settings enable row level security;
create policy "settings_select_all" on public.store_settings for select using (true);
create policy "settings_update_auth" on public.store_settings for update using (auth.uid() is not null);
create policy "settings_insert_auth" on public.store_settings for insert with check (auth.uid() is not null);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'biller')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
