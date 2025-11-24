"use client"

import { useState } from "react"
import { LoginPage } from "@/components/login-page"
import { CorporateDashboard } from "@/components/corporate-dashboard"
import { BranchDashboard } from "@/components/branch-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function DashboardPage() {
  const [authState, setAuthState] = useState<"login" | "corporate" | "branch" | "admin">("login")

  const handleLogout = () => {
    setAuthState("login")
  }

  if (authState === "login") {
    return <LoginPage onLogin={(role) => setAuthState(role)} />
  }

  return (
    <main className="min-h-screen bg-background">
      {authState === "corporate" ? (
        <CorporateDashboard />
      ) : authState === "branch" ? (
        <BranchDashboard />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </main>
  )
}
