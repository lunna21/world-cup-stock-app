"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  PackageSearch,
  Settings,
  Shirt,
  Trophy
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Vista general"
  },
  {
    title: "Predicciones",
    href: "/predicciones",
    icon: TrendingUp,
    description: "Probabilidades ML"
  },
  {
    title: "Recomendaciones",
    href: "/recomendaciones",
    icon: PackageSearch,
    description: "Acciones de stock"
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Shirt,
    description: "Gestión de camisetas"
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Mundial 2026</span>
            <span className="text-xs text-muted-foreground">Stock Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Modelo ML</span>
              <span className="text-xs text-muted-foreground">v2.3.1</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
