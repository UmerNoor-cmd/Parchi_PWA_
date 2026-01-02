"use client"

import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/portal-access")
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard onLogout={handleLogout} />
    </ProtectedRoute>
  )
}
