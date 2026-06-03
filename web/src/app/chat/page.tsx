'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Deze module wordt binnenkort gebouwd.</p>
        </CardContent>
      </Card>
    </div>
  )
}
