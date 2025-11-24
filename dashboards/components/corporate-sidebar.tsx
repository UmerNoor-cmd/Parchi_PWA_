"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Ticket, Store, BarChart3, LogOut, Menu, X } from "lucide-react"

interface CorporateSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "offers", label: "Manage Offers", icon: Ticket },
  { id: "branches", label: "Branches", icon: Store },
  { id: "reports", label: "Reports", icon: BarChart3 },
]

export function CorporateSidebar({ activeTab, onTabChange }: CorporateSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-muted rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform z-40 flex flex-col`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-sidebar-primary">Parchi</h2>
          <p className="text-sm text-sidebar-foreground/60 mt-1">Corporate Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button variant="outline" className="w-full gap-2 justify-center bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
