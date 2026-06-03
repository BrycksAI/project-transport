# Project Transport — Architecture

## Tech Stack
- **Web:** Next.js 14 (TypeScript, Tailwind, shadcn/ui)
- **Mobile:** React Native / Expo
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Maps:** Mapbox GL JS (web) / Mapbox SDK (mobile)
- **Hosting:** Vercel (web) + Supabase (db)
- **Payments:** Stripe
- **Repo:** github.com/BrycksAI/project-transport

## Database Schema

### companies
id, name, kvk_number, address, phone, subscription_tier, created_at

### users
id, company_id, role (admin|dispatcher|driver), name, email, phone, avatar_url

### vehicles
id, company_id, license_plate, type (truck|van|trailer), capacity_kg, capacity_m3, driver_id (FK users), active

### customers
id, company_id, name, address, contact_person, phone, email, notes

### orders
id, company_id, customer_id, vehicle_id, driver_id, pickup_address, delivery_address, pickup_lat, pickup_lng, delivery_lat, delivery_lng, pickup_time, delivery_time, status (created|assigned|loading|in_transit|delivered|cancelled), weight_kg, volume_m3, notes, reference_number, created_at, updated_at

### routes
id, company_id, vehicle_id, driver_id, date, status (planned|active|completed), total_distance_km, total_duration_min, optimized

### route_stops
id, route_id, order_id, stop_number, type (pickup|delivery), eta, arrival_time, actual_arrival

### messages
id, company_id, sender_id, recipient_id, order_id, route_id, content, message_type (text|preset|image|system), created_at, read_at

### presets
id, company_id, label_nl, message_text, sort_order

### proof_of_delivery
id, order_id, driver_id, signature_url, photo_urls (json array), recipient_name, recipient_notes, delivered_at, gps_lat, gps_lng

### subscriptions
id, company_id, stripe_subscription_id, stripe_customer_id, tier (starter|growth|scale), status, vehicle_count, unit_price_cents, total_cents, period_start, period_end

## Build Phases

Phase 1 — Foundation (Week 1-2)
- Supabase project setup + schema
- Auth (email/password, magic link, roles)
- Company onboarding flow
- CRUD: vehicles, customers, users

Phase 2 — Order & Route Management (Week 3-4)
- Order creation with map picker
- Route planning (drag-and-drop stops)
- Driver assignment
- Status tracking pipeline

Phase 3 — Chat (Week 5)
- Supabase Realtime for messages
- Dispatcher view: inbox with threads
- Driver view: chat per route/order
- Preset quick messages

Phase 4 — Proof of Delivery (Week 6-7)
- Mobile: camera + signature capture
- Upload to Supabase Storage
- Customer notification link

Phase 5 — Launch (Week 8)
- Stripe subscription billing
- Dashboard with KPIs
- Dutch language (i18n)
- First customer onboarding

## Pricing
Starter (1-5): €79/vehicle/mo
Growth (6-20): €59/vehicle/mo
Scale (21-50): €49/vehicle/mo
All features included.

## Repo Structure
project-transport/
  apps/
    web/         # Next.js app
    mobile/      # React Native / Expo app
  packages/
    shared/      # Shared types, utils, validation
  supabase/
    migrations/  # Database migrations
    seed.sql     # Seed data
  docs/          # Documentation
