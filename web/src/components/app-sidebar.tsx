'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Truck, LayoutDashboard, Package, Users, Route, MessageSquare, Settings } from 'lucide-react'

const navRoutes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Ritten', icon: Package, href: '/orders' },
  { label: 'Routes', icon: Route, href: '/routes' },
  { label: 'Voertuigen', icon: Truck, href: '/vehicles' },
  { label: 'Klanten', icon: Users, href: '/customers' },
  { label: 'Chat', icon: MessageSquare, href: '/chat' },
]

export function AppSidebar() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Transport</span>
        </Link>
      </div>

      <div className="flex-1 p-3">
        <nav className="space-y-1">
          {navRoutes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  pathname === route.href && 'bg-accent text-accent-foreground'
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="h-4 w-4" />
            Instellingen
          </Button>
        </Link>
      </div>
    </aside>
  )
}
