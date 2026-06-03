import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Company = {
  id: string
  name: string
  kvk_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  subscription_tier: string
  created_at: string
}

export type User = {
  id: string
  company_id: string
  email: string
  name: string
  phone: string | null
  role: 'admin' | 'dispatcher' | 'driver'
  avatar_url: string | null
  is_active: boolean
}

export type Vehicle = {
  id: string
  company_id: string
  license_plate: string
  brand: string | null
  model: string | null
  type: 'truck' | 'van' | 'trailer' | null
  capacity_kg: number | null
  capacity_m3: number | null
  driver_id: string | null
  is_active: boolean
}

export type Customer = {
  id: string
  company_id: string
  name: string
  address: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export type Order = {
  id: string
  company_id: string
  customer_id: string | null
  vehicle_id: string | null
  driver_id: string | null
  reference_number: string | null
  pickup_address: string
  pickup_lat: number | null
  pickup_lng: number | null
  delivery_address: string
  delivery_lat: number | null
  delivery_lng: number | null
  pickup_time: string | null
  delivery_time: string | null
  status: 'created' | 'assigned' | 'loading' | 'in_transit' | 'delivered' | 'cancelled'
  weight_kg: number | null
  volume_m3: number | null
  notes: string | null
  created_at: string
}

export type Route = {
  id: string
  company_id: string
  vehicle_id: string | null
  driver_id: string | null
  date: string
  status: 'planned' | 'active' | 'completed'
  total_distance_km: number | null
  total_duration_min: number | null
}

export type Message = {
  id: string
  company_id: string
  sender_id: string
  recipient_id: string | null
  order_id: string | null
  content: string
  message_type: 'text' | 'preset' | 'image' | 'system'
  created_at: string
  read_at: string | null
}
