"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Map, Users, FileText, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { href: "/dashboard/map", label: "Map View", icon: Map, roles: ["admin", "user"] },
    { href: "/dashboard/surveys", label: "Manage Surveys", icon: FileText, roles: ["admin", "user"] },
    { href: "/dashboard/users", label: "Manage Users", icon: Users, roles: ["admin"] },
  ]

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/space-background.webp')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className="w-64 backdrop-blur-md bg-black/30 border-r border-white/10">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-8">Survey Dashboard</h1>

            {/* User Info */}
            <Card className="bg-white/10 border-white/20 p-4 mb-6">
              <div className="text-white">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-300">{user?.email}</p>
                <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
              </div>
            </Card>

            {/* Navigation */}
            <nav className="space-y-2">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start text-white hover:bg-white/20 ${
                        isActive ? "bg-purple-600/50" : ""
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-6 left-6 right-6">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
