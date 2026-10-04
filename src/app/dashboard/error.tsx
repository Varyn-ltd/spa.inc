"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-xl font-semibold">Unable to load this page</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Something went wrong while fetching this data.
        </p>
        <Button onClick={reset} size="sm" className="mt-1">
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}
