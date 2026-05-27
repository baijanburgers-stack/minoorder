-- 20260525000000_init_schema.sql
-- MinoOrder Database Schema
-- Designed by Principal Enterprise Architect, PlatePixels

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Custom Custom Enums
create type user_role as enum ('super_admin', 'store_admin', 'cashier', 'kitchen', 'device');
create type order_status as enum ('draft', 'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled', 'refunded');
create type payment_method as enum ('cash', 'card', 'bancontact', 'payconiq', 'split');
create type payment_status as enum ('pending', 'authorized', 'captured', 'failed', 'refunded');
create type device_type as enum ('pos', 'kiosk');
create type vat_category as enum ('food', 'soft_drink', 'alcohol', 'service');

-- 1. Tenants Table (PlatePixels clients/restaurant chains)
create table tenants (
    id uuid primary key default uuid_generate_v4(),
    name varchar(255) not null,
    domain varchar(255) unique,
    billing_email varchar(255) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Stores Table (Individual Restaurant Locations)
create table stores (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    name varchar(255) not null,
    company_name varchar(255) not null,
    vat_number varchar(50) not null,
    street varchar(255) not null,
    city varchar(100) not null,
    postal_code varchar(20) not null,
    country varchar(2) not null default 'BE',
    phone varchar(50),
    email varchar(255),
    opening_hours jsonb, -- Map of day of week to opening/closing times
    theme_settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Profiles Table (Linked to Supabase Auth auth.users)
create table profiles (
    id uuid primary key,
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(50),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Store Users mapping (Roles within specific stores)
create table store_users (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    role user_role not null default 'cashier',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(store_id, user_id)
);

-- 5. Devices Table (POS and Kiosk terminals)
create table devices (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    store_id uuid not null references stores(id) on delete cascade,
    name varchar(100) not null,
    hardware_uuid varchar(255) not null unique,
    type device_type not null,
    is_authorized boolean not null default false,
    last_heartbeat timestamp with time zone,
    configuration jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. VAT Rules Table
create table vat_rules (
    id uuid primary key default uuid_generate_v4(),
    country varchar(2) not null default 'BE',
    category vat_category not null,
    takeaway_rate numeric(5,2) not null, -- e.g., 6.00
    dine_in_rate numeric(5,2) not null,  -- e.g., 12.00 or 21.00
    description varchar(255),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(country, category)
);

-- 7. Categories Table
create table categories (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    name jsonb not null, -- Multilingual names: {"en": "Burgers", "nl": "Burgers", "fr": "Burgers"}
    description jsonb,
    sort_order integer not null default 0,
    is_visible_pos boolean not null default true,
    is_visible_kiosk boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Subcategories Table
create table subcategories (
    id uuid primary key default uuid_generate_v4(),
    category_id uuid not null references categories(id) on delete cascade,
    name jsonb not null,
    sort_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Items Table (Products)
create table items (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    subcategory_id uuid references subcategories(id) on delete set null,
    category_id uuid not null references categories(id) on delete cascade,
    name jsonb not null, -- Multilingual
    description jsonb,
    image_url varchar(1024),
    gross_price numeric(10,2) not null, -- Inclusive of VAT
    vat_rule_id uuid not null references vat_rules(id),
    is_available boolean not null default true,
    availability_schedule jsonb, -- Time slots of availability
    is_draft boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Modifier Groups Table
create table modifier_groups (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    name jsonb not null,
    min_selection integer not null default 0,
    max_selection integer not null default 1,
    is_required boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Modifier Options Table
create table modifier_options (
    id uuid primary key default uuid_generate_v4(),
    modifier_group_id uuid not null references modifier_groups(id) on delete cascade,
    name jsonb not null,
    gross_price numeric(10,2) not null default 0.00,
    vat_rule_id uuid not null references vat_rules(id),
    is_available boolean not null default true,
    sort_order integer not null default 0
);

-- Joint table to link items with modifier groups
create table item_modifier_groups (
    item_id uuid not null references items(id) on delete cascade,
    modifier_group_id uuid not null references modifier_groups(id) on delete cascade,
    sort_order integer not null default 0,
    primary key (item_id, modifier_group_id)
);

-- 12. Combos Table (Fixed-price bundle rules)
create table combos (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    name jsonb not null,
    description jsonb,
    image_url varchar(1024),
    fixed_price numeric(10,2) not null,
    is_available boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Combo Components Table (Groups of choices inside a combo, e.g. "Select a drink")
create table combo_components (
    id uuid primary key default uuid_generate_v4(),
    combo_id uuid not null references combos(id) on delete cascade,
    name jsonb not null, -- E.g. {"en": "Choose a main"}
    min_selection integer not null default 1,
    max_selection integer not null default 1,
    sort_order integer not null default 0
);

-- Junction table to associate items allowed in a combo component
create table combo_component_items (
    combo_component_id uuid not null references combo_components(id) on delete cascade,
    item_id uuid not null references items(id) on delete cascade,
    additional_gross_price numeric(10,2) not null default 0.00, -- Upcharge
    primary key (combo_component_id, item_id)
);

-- 14. Menu Snapshots Table (Immutable published states)
create table menu_snapshots (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    version integer not null,
    snapshot jsonb not null, -- Giant serialized JSON of published categories, items, combos, modifiers
    published_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Shifts Table (POS Cashier Sessions)
create table shifts (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    device_id uuid not null references devices(id),
    user_id uuid not null references profiles(id),
    opened_at timestamp with time zone default timezone('utc'::text, now()) not null,
    closed_at timestamp with time zone,
    opening_cash numeric(10,2) not null,
    closing_cash numeric(10,2),
    expected_closing_cash numeric(10,2),
    is_fiscally_signed boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. Orders Table
create table orders (
    id uuid primary key default uuid_generate_v4(), -- Idempotency token sent by client
    store_id uuid not null references stores(id) on delete cascade,
    device_id uuid not null references devices(id),
    shift_id uuid references shifts(id),
    order_number varchar(50) not null, -- Sequential daily code (e.g. K-01, POS-42)
    is_takeaway boolean not null default false,
    status order_status not null default 'pending',
    total_gross numeric(10,2) not null,
    total_net numeric(10,2) not null,
    total_vat numeric(10,2) not null,
    customer_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast daily statistics and list fetches
create index idx_orders_store_created on orders(store_id, created_at desc);

-- 17. Order Lines Table
create table order_lines (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    item_id uuid references items(id) on delete set null,
    combo_id uuid references combos(id) on delete set null,
    name varchar(255) not null, -- Snapshotted name at purchase
    quantity integer not null default 1,
    unit_gross numeric(10,2) not null,
    unit_net numeric(10,2) not null,
    unit_vat numeric(10,2) not null,
    vat_rate numeric(5,2) not null, -- Snapshot rate (e.g., 6.00)
    combo_discount_allocated numeric(10,2) default 0.00
);

-- 18. Order Line Modifiers Table
create table order_line_modifiers (
    id uuid primary key default uuid_generate_v4(),
    order_line_id uuid not null references order_lines(id) on delete cascade,
    modifier_option_id uuid references modifier_options(id) on delete set null,
    name varchar(255) not null,
    quantity integer not null default 1,
    unit_gross numeric(10,2) not null default 0.00,
    unit_net numeric(10,2) not null default 0.00,
    unit_vat numeric(10,2) not null default 0.00,
    vat_rate numeric(5,2) not null
);

-- 19. Payments Table
create table payments (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    method payment_method not null,
    status payment_status not null default 'pending',
    amount numeric(10,2) not null,
    transaction_reference varchar(255), -- E.g. card terminal trace ID
    gateway_metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 20. Receipts & Fiscal Signatures Table
create table receipts (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    receipt_number varchar(100) not null unique, -- Standardized legal format
    fiscal_provider varchar(50) not null,        -- E.g. 'fiskaly', 'fdm'
    fiscal_signature text not null,
    fiscal_payload jsonb not null,               -- Raw values returned by provider
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 21. Printer Configurations
create table printer_configs (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    name varchar(100) not null,
    connection_type varchar(50) not null, -- 'ip', 'usb', 'bluetooth'
    address varchar(255) not null,         -- '192.168.1.200', '/dev/usb/lp0'
    role varchar(50) not null default 'kitchen', -- 'receipt', 'kitchen', 'bar'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 22. Audit Logs Table (Legally required system logging)
create table audit_logs (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references tenants(id) on delete set null,
    store_id uuid references stores(id) on delete set null,
    user_id uuid references profiles(id) on delete set null,
    action varchar(100) not null,
    table_name varchar(100) not null,
    row_id uuid,
    old_value jsonb,
    new_value jsonb,
    ip_address varchar(45),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 23. Subscriptions & Billing Table
create table subscriptions (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    stripe_subscription_id varchar(255),
    status varchar(50) not null default 'active',
    plan_name varchar(100) not null,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 24. Billing Invoices
create table billing_invoices (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references tenants(id) on delete cascade,
    invoice_number varchar(100) not null,
    amount numeric(10,2) not null,
    vat_amount numeric(10,2) not null,
    pdf_url varchar(1024),
    paid_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 25. Fiscal Devices Table (Belgium FDM / digital black box status)
create table fiscal_devices (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    device_id uuid not null references devices(id) on delete cascade,
    fdm_serial_number varchar(255) not null,
    fdm_certificate_expiry date,
    status varchar(50) not null default 'offline',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 26. Fiscal Logs Table (Direct API calls log to audits)
create table fiscal_logs (
    id uuid primary key default uuid_generate_v4(),
    store_id uuid not null references stores(id) on delete cascade,
    device_id uuid not null references devices(id) on delete cascade,
    request_type varchar(100) not null, -- 'sign_order', 'x_report', 'z_report'
    payload jsonb not null,
    response_status integer not null,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------

alter table tenants enable row level security;
alter table stores enable row level security;
alter table store_users enable row level security;
alter table devices enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

-- Helper SQL Function: Extract Role for logged-in user at a specific store
create or replace function get_user_role_for_store(store_id uuid)
returns user_role as $$
  select role from store_users 
  where store_users.store_id = $1 
    and store_users.user_id = auth.uid() 
  limit 1;
$$ language sql security definer;

-- Helper SQL Function: Verify Tenant Association
create or replace function is_tenant_member(tenant_id uuid)
returns boolean as $$
  select exists (
    select 1 from store_users 
    where store_users.tenant_id = $1 
      and store_users.user_id = auth.uid()
  );
$$ language sql security definer;

-- Tenants Policies
create policy "Super Admin can manage all tenants"
on tenants for all
to authenticated
using ( (select role from store_users where user_id = auth.uid() limit 1) = 'super_admin' );

create policy "Tenant member can view own tenant profile"
on tenants for select
to authenticated
using ( is_tenant_member(id) );

-- Stores Policies
create policy "Super Admin can write stores"
on stores for all
to authenticated
using ( (select role from store_users where user_id = auth.uid() limit 1) = 'super_admin' );

create policy "Store Admins and staff can view their own stores"
on stores for select
to authenticated
using ( is_tenant_member(tenant_id) );

create policy "Store Admins can update their own store settings"
on stores for update
to authenticated
using ( get_user_role_for_store(id) = 'store_admin' )
with check ( get_user_role_for_store(id) = 'store_admin' );

-- Menu Items Policies
create policy "Anonymous/Kiosk devices can select menu items for their store"
on items for select
to authenticated, anon
using (
    exists (
        select 1 from devices 
        where devices.store_id = items.store_id 
          and devices.is_authorized = true
    ) 
    or 
    exists (
        select 1 from store_users 
        where store_users.store_id = items.store_id 
          and store_users.user_id = auth.uid()
    )
);

create policy "Store admins can edit items"
on items for all
to authenticated
using ( get_user_role_for_store(store_id) = 'store_admin' );

-- Orders Policies
create policy "Devices and Staff can insert orders for their store"
on orders for insert
to authenticated
with check (
    exists (
        select 1 from devices 
        where devices.id = device_id 
          and devices.store_id = store_id 
          and devices.is_authorized = true
    )
    or
    exists (
        select 1 from store_users 
        where store_users.store_id = store_id 
          and store_users.user_id = auth.uid()
    )
);

create policy "Staff and devices can read their store orders"
on orders for select
to authenticated
using (
    exists (
        select 1 from store_users 
        where store_users.store_id = store_id 
          and store_users.user_id = auth.uid()
    )
    or
    exists (
        select 1 from devices 
        where devices.id = device_id 
          and devices.store_id = store_id
    )
);

-- =============================================================
-- RLS POLICY PATCH: UNBLOCKING STORES, CATEGORIES & DEVICES
-- =============================================================

-- 1. store_users table select policy
create policy "Allow users to read their own mappings" 
on store_users for select 
to authenticated 
using ( user_id = auth.uid() );

-- 2. categories table policies
create policy "Allow store staff to view categories" 
on categories for select 
to authenticated
using (
  exists (
    select 1 from store_users 
    where store_users.store_id = categories.store_id 
      and store_users.user_id = auth.uid()
  )
);

create policy "Allow store admins to manage categories" 
on categories for all 
to authenticated
using ( get_user_role_for_store(store_id) = 'store_admin' );

-- 3. devices table policies
create policy "Allow store staff to view devices" 
on devices for select 
to authenticated
using (
  exists (
    select 1 from store_users 
    where store_users.store_id = devices.store_id 
      and store_users.user_id = auth.uid()
  )
);

create policy "Allow store admins to manage devices" 
on devices for all 
to authenticated
using ( get_user_role_for_store(store_id) = 'store_admin' );

-- 4. order_lines table policies
create policy "Allow store staff to view order lines" 
on order_lines for select 
to authenticated
using (
  exists (
    select 1 from orders 
    where orders.id = order_lines.order_id 
      and exists (
        select 1 from store_users 
        where store_users.store_id = orders.store_id 
          and store_users.user_id = auth.uid()
      )
  )
);

create policy "Allow store staff to insert order lines" 
on order_lines for insert 
to authenticated
with check (
  exists (
    select 1 from orders 
    where orders.id = order_id 
      and exists (
        select 1 from store_users 
        where store_users.store_id = orders.store_id 
          and store_users.user_id = auth.uid()
      )
  )
);

-- 5. payments table policies
create policy "Allow store staff to view payments" 
on payments for select 
to authenticated
using (
  exists (
    select 1 from orders 
    where orders.id = payments.order_id 
      and exists (
        select 1 from store_users 
        where store_users.store_id = orders.store_id 
          and store_users.user_id = auth.uid()
      )
  )
);

create policy "Allow store staff to insert payments" 
on payments for insert 
to authenticated
with check (
  exists (
    select 1 from orders 
    where orders.id = order_id 
      and exists (
        select 1 from store_users 
        where store_users.store_id = orders.store_id 
          and store_users.user_id = auth.uid()
      )
  )
);
