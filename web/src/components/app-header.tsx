'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/login') return null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="font-semibold">
          {pathname === '/dashboard' && 'Dashboard'}
          {pathname === '/orders' && 'Ritten'}
          {pathname === '/routes' && 'Routes'}
          {pathname === '/vehicles' && 'Voertuigen'}
          {pathname === '/customers' && 'Klanten'}
          {pathname === '/chat' && 'Chat'}
          {pathname.startsWith('/login') && 'Inloggen'}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
