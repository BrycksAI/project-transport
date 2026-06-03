'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ritten</h1>
          <p className="text-muted-foreground">Beheer alle transport ritten</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe rit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle ritten</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nog geen ritten. Maak uw eerste rit aan.</p>
        </CardContent>
      </Card>
    </div>
  )
}
