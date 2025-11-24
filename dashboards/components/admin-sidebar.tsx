"use client"

import { LayoutDashboard, Users, FileText, Settings, LogOut, CheckCircle2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
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
      id: "merchants",
      label: "Merchant Approval",
      icon: ShoppingCart,
    },
    {
      id: "offers",
      label: "Offer Oversight",
      icon: FileText,
    },
    {
      id: "logs",
      label: "System Logs",
      icon: CheckCircle2,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="sticky top-0 w-64 h-screen bg-white border-r border-border flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Parchi Admin</h2>
        <p className="text-xs text-muted-foreground mt-1">System Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left ${
                activeTab === item.id ? "bg-primary text-white" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button onClick={onLogout} variant="outline" className="w-full gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
