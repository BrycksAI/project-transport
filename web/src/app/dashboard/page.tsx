import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, Package, Users, Route } from 'lucide-react'

async function getStats(companyId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { count: vehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('company_id', companyId)
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('company_id', companyId)
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('company_id', companyId)
  const { count: activeRouteCount } = await supabase.from('routes').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'active')

  // Active orders today
  const today = new Date().toISOString().split('T')[0]
  const { count: todayOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .in('status', ['assigned', 'loading', 'in_transit'])

  return { vehicleCount: vehicleCount || 0, orderCount: orderCount || 0, customerCount: customerCount || 0, activeRouteCount: activeRouteCount || 0, todayOrders: todayOrders || 0 }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*').eq('email', user?.email).single()

  const companyId = profile?.company_id
  const stats = companyId ? await getStats(companyId) : { vehicleCount: 0, orderCount: 0, customerCount: 0, activeRouteCount: 0, todayOrders: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welkom terug, {profile?.name || 'Gebruiker'}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Voertuigen</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicleCount}</div>
            <p className="text-xs text-muted-foreground">Totaal actieve voertuigen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Openstaande ritten</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Vandaag onderweg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klanten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground">Totaal klanten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actieve routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRouteCount}</div>
            <p className="text-xs text-muted-foreground">Nu actief</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recente ritten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Geen recente ritten gevonden.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Snelle acties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Nieuwe rit aanmaken, voertuig toevoegen of chat met chauffeur.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
