"use client"

import { useState } from "react"
import { LayoutDashboard, Users, FileText, LogOut, CheckCircle2, ShoppingCart, Loader2, Store, Bell, UserX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

import { DASHBOARD_COLORS } from "@/lib/colors"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function AdminSidebarContent({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const colors = DASHBOARD_COLORS("admin")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setIsLoggingOut(false)
    }
  }
  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "kyc",
      label: "Student KYC",
      icon: Users,
    },
    {
      id: "financials",
      label: "Financials",
      icon: CheckCircle2, // Using CheckCircle2 for now, or DollarSign if imported. Let's check imports.
    },
    {
      id: "merchants",
      label: "Merchants",
      icon: ShoppingCart,
    },
    {
      id: "branches",
      label: "Branches",
      icon: Store,
    },
    {
      id: "offers",
      label: "Offers",
      icon: FileText,
    },
    {
      id: "logs",
      label: "Audit Logs",
      icon: CheckCircle2,
    },
    {
      id: "account-creation",
      label: "Account Creation",
      icon: Users,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      id: "account-deletions",
      label: "Deletion Requests",
      icon: UserX,
    },
    {
      id: "system-config",
      label: "System Config",
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col h-full bg-white text-foreground">
      <div className="p-6 border-b border-border">
        <img src="/ParchiFullTextNewBlue.svg" alt="Parchi" className="h-8 w-auto mb-2" />
        <p className="text-xs text-muted-foreground mt-1">System Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${activeTab === item.id ? "text-white" : "text-foreground hover:bg-muted"
                }`}
              style={{
                backgroundColor: activeTab === item.id ? colors.primary : "transparent",
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full gap-2 text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Logout
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function AdminSidebar(props: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex sticky top-0 w-64 h-screen border-r border-border flex-col overflow-y-auto bg-white">
      <AdminSidebarContent {...props} />
    </aside>
  )
}
