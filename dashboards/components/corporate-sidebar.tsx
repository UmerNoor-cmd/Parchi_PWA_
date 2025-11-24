"use client"

import { LayoutDashboard, Ticket, Store, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CorporateSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function CorporateSidebar({ activeTab, onTabChange }: CorporateSidebarProps) {
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "offers",
      label: "Manage Offers",
      icon: Ticket,
    },
    {
      id: "branches",
      label: "Branches",
      icon: Store,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
  ]

  return (
    <aside className="sticky top-0 w-64 h-screen bg-white border-r border-border flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Parchi</h2>
        <p className="text-xs text-muted-foreground mt-1">Corporate Dashboard</p>
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
        <Button variant="outline" className="w-full gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
