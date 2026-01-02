"use client"

import { useRouter } from "next/navigation"
import { BranchDashboard } from "@/components/branch-dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function BranchPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/portal-access")
  }

  return (
    <ProtectedRoute allowedRoles={['merchant_branch']}>
      <BranchDashboard onLogout={handleLogout} />
    </ProtectedRoute>
  )
}
