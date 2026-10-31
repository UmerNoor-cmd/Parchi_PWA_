"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import AdminAds from "@/components/admin-ads"

// Standalone route for the Home Banners tab (also in the admin sidebar).
export default function AdminAdsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <AdminAds />
      </div>
    </ProtectedRoute>
  )
}
