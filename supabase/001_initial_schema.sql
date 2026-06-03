-- Project Transport — Database Migration
-- Run this in Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/nvydvxrzzaszvkmqjyeb/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    kvk_number TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    subscription_tier TEXT DEFAULT 'starter',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'dispatcher', 'driver')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    license_plate TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    type TEXT CHECK (type IN ('truck', 'van', 'trailer')),
    capacity_kg NUMERIC,
    capacity_m3 NUMERIC,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, license_plate)
);

-- 4. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reference_number TEXT,
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC,
    pickup_lng NUMERIC,
    delivery_address TEXT NOT NULL,
    delivery_lat NUMERIC,
    delivery_lng NUMERIC,
    pickup_time TIMESTAMPTZ,
    delivery_time TIMESTAMPTZ,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'assigned', 'loading', 'in_transit', 'delivered', 'cancelled')),
    weight_kg NUMERIC,
    volume_m3 NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROUTES
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    total_distance_km NUMERIC,
    total_duration_min NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROUTE STOPS
CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    stop_number INTEGER NOT NULL,
    type TEXT CHECK (type IN ('pickup', 'delivery')),
    eta TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    UNIQUE(route_id, stop_number)
);

-- 8. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'preset', 'image', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 9. PRESETS (quick chat messages)
CREATE TABLE IF NOT EXISTS presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    label_nl TEXT NOT NULL,
    message_text TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(company_id, label_nl)
);

-- 10. PROOF OF DELIVERY
CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    signature_url TEXT,
    photo_urls JSONB DEFAULT '[]',
    recipient_name TEXT,
    recipient_notes TEXT,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    gps_lat NUMERIC,
    gps_lng NUMERIC
);

-- 11. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('starter', 'growth', 'scale')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    vehicle_count INTEGER DEFAULT 1,
    unit_price_cents INTEGER,
    total_cents INTEGER,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default presets (Dutch quick messages)
INSERT INTO presets (company_id, label_nl, message_text, sort_order) VALUES
    (NULL, 'Laden voltooid', 'Laden is voltooid, ik vertrek nu.', 1),
    (NULL, 'Onderweg', 'Ik ben onderweg naar de volgende stop.', 2),
    (NULL, 'Vertraging', 'Ik heb vertraging door verkeer. Naar verwachting +15 min.', 3),
    (NULL, 'Afgeleverd', 'Bestelling is afgeleverd. Bon ontvangen.', 4),
    (NULL, 'Probleem melden', 'Ik heb een probleem, bel me even.', 5),
    (NULL, 'Pauze', 'Ik ga pauze nemen.', 6),
    (NULL, 'Klaar voor morgen', 'Route voor morgen is klaar.', 7)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
