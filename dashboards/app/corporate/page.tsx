"use client"

import { useRouter } from "next/navigation"
import { CorporateDashboard } from "@/components/corporate-dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function CorporatePage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/portal-access")
  }

  return (
    <ProtectedRoute allowedRoles={['merchant_corporate']}>
      <CorporateDashboard onLogout={handleLogout} />
    </ProtectedRoute>
  )
}
