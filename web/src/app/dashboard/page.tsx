import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Truck, Package, Users, Route, TrendingUp, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { OrdersChart } from './orders-chart'

async function getDashboardData(companyId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // Vehicles
  const { data: vehicles } = await supabase.from('vehicles').select('*').eq('company_id', companyId)

  // Orders - recent 5
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, customers(name), drivers:users!driver_id(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Orders by status
  const { data: ordersByStatus } = await supabase
    .from('orders')
    .select('status')
    .eq('company_id', companyId)

  // Order counts by status
  const statusCounts: Record<string, number> = { created: 0, assigned: 0, loading: 0, in_transit: 0, delivered: 0, cancelled: 0 }
  ordersByStatus?.forEach((o: { status: string }) => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++
  })
  const totalOrders = ordersByStatus?.length || 0

  // Customers count
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('company_id', companyId)

  // Active routes
  const { data: activeRoutes } = await supabase.from('routes').select('*, vehicles(license_plate), drivers:users!routes_driver_id_fkey(name)').eq('company_id', companyId).eq('status', 'active').limit(3)

  // Drivers online (users with role=driver that are active)
  const { count: driverCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('role', 'driver').eq('is_active', true)

  return {
    vehicles: vehicles || [],
    recentOrders: recentOrders || [],
    statusCounts,
    totalOrders,
    customerCount: customerCount || 0,
    activeRoutes: activeRoutes || [],
    driverCount: driverCount || 0,
    activeVehicleCount: vehicles?.filter(v => v.is_active).length || 0,
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    created: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    loading: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-green-100 text-green-800',
    delivered: 'bg-green-600 text-white',
    cancelled: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    created: 'Aangemaakt',
    assigned: 'Toegewezen',
    loading: 'Laden',
    in_transit: 'Onderweg',
    delivered: 'Afgeleverd',
    cancelled: 'Geannuleerd',
  }
  return { variant: variants[status] || '', label: labels[status] || status }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*, companies(name)').eq('email', user?.email).single()
  const data = profile?.company_id ? await getDashboardData(profile.company_id) : null

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welkom terug, {profile?.name || 'Gebruiker'}
            {profile?.companies?.name && <span> — <strong>{profile.companies.name}</strong></span>}
          </p>
        </div>
        <Link href="/orders">
          <Button>
            <Package className="h-4 w-4 mr-2" />
            Nieuwe rit
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actieve voertuigen</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeVehicleCount || 0}</div>
            <p className="text-xs text-muted-foreground">van {data?.vehicles?.length || 0} totaal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Onderweg</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.statusCounts.in_transit || 0}</div>
            <p className="text-xs text-muted-foreground">ritten onderweg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vandaag afgeleverd</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.statusCounts.delivered || 0}</div>
            <p className="text-xs text-muted-foreground">voltooide ritten</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chauffeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.driverCount || 0}</div>
            <p className="text-xs text-muted-foreground">actief</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.customerCount || 0}</div>
            <p className="text-xs text-muted-foreground">totaal</p>
          </CardContent>
        </Card>
      </div>

      {/* Status overview + Chart */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Rit status overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={data?.statusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voertuig bezetting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Actief</span>
                <span className="font-medium">{data?.activeVehicleCount || 0}/{data?.vehicles?.length || 0}</span>
              </div>
              <Progress value={data?.vehicles?.length ? (data.activeVehicleCount / data.vehicles.length) * 100 : 0} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ritten onderweg</span>
                <span className="font-medium">{data?.statusCounts.in_transit || 0}/{data?.totalOrders || 0}</span>
              </div>
              <Progress
                value={data?.totalOrders ? (data.statusCounts.in_transit / data.totalOrders) * 100 : 0}
                className="bg-blue-100"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Voltooid vandaag</span>
                <span className="font-medium">{data?.statusCounts.delivered || 0}/{data?.totalOrders || 0}</span>
              </div>
              <Progress
                value={data?.totalOrders ? (data.statusCounts.delivered / data.totalOrders) * 100 : 0}
                className="bg-green-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Active Routes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recente ritten</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm">Bekijk alles</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentOrders?.length ? (
              <div className="space-y-3">
                {data.recentOrders.map((order) => {
                  const status = getStatusBadge(order.status)
                  return (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{order.reference_number || 'Geen referentie'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customers?.name || 'Onbekend'} — {order.drivers?.name || 'Geen chauffeur'}
                        </p>
                      </div>
                      <Badge className={status.variant}>{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nog geen ritten.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actieve routes</CardTitle>
            <Link href="/routes">
              <Button variant="ghost" size="sm">Bekijk alles</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.activeRoutes?.length ? (
              <div className="space-y-3">
                {data.activeRoutes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{route.vehicles?.license_plate || 'Geen voertuig'}</p>
                      <p className="text-xs text-muted-foreground">{route.drivers?.name || 'Geen chauffeur'}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Actief
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Geen actieve routes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
