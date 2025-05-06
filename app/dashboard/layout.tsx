"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Users, Settings, Home, FileText, Wrench, Calculator, LogOut, Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const auth = localStorage.getItem("airGeorgiaAuth")
        if (auth) {
          const { isAuthenticated, role, username } = JSON.parse(auth)
          setIsAuthenticated(isAuthenticated)
          setRole(role)
          setUsername(username)
        } else {
          // For demo purposes, set a default role if not authenticated
          // In a real app, you would redirect to login
          const pathParts = pathname.split("/")
          if (pathParts.length >= 3) {
            setRole(pathParts[2])
            setIsAuthenticated(true)
          }
        }
      }
    }

    checkAuth()

    // Close sidebar on mobile by default
    if (isMobile) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [pathname, isMobile])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("airGeorgiaAuth")
    setIsAuthenticated(false)
    router.push("/")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Define navigation items based on role
  const getNavItems = () => {
    const commonItems = [{ name: "Dashboard", icon: <Home className="h-5 w-5" />, path: `/dashboard/${role}` }]

    const roleSpecificItems = {
      customer: [
        { name: "Service History", icon: <FileText className="h-5 w-5" />, path: `/dashboard/${role}/service-history` },
        { name: "Schedule Service", icon: <Wrench className="h-5 w-5" />, path: `/dashboard/${role}/schedule` },
        { name: "Billing", icon: <Calculator className="h-5 w-5" />, path: `/dashboard/${role}/billing` },
      ],
      tech: [
        { name: "Work Orders", icon: <Wrench className="h-5 w-5" />, path: `/dashboard/${role}/work-orders` },
        { name: "Schedule", icon: <FileText className="h-5 w-5" />, path: `/dashboard/${role}/schedule` },
        { name: "Parts Inventory", icon: <Calculator className="h-5 w-5" />, path: `/dashboard/${role}/inventory` },
      ],
      accounting: [
        { name: "Invoices", icon: <FileText className="h-5 w-5" />, path: `/dashboard/${role}/invoices` },
        { name: "Payments", icon: <Calculator className="h-5 w-5" />, path: `/dashboard/${role}/payments` },
        { name: "Reports", icon: <FileText className="h-5 w-5" />, path: `/dashboard/${role}/reports` },
      ],
      admin: [
        { name: "Users", icon: <Users className="h-5 w-5" />, path: `/dashboard/${role}/users` },
        { name: "Customers", icon: <User className="h-5 w-5" />, path: `/dashboard/${role}/customers` },
        { name: "Technicians", icon: <Wrench className="h-5 w-5" />, path: `/dashboard/${role}/technicians` },
        { name: "Reports", icon: <FileText className="h-5 w-5" />, path: `/dashboard/${role}/reports` },
        { name: "Settings", icon: <Settings className="h-5 w-5" />, path: `/dashboard/${role}/settings` },
      ],
    }

    return [...commonItems, ...((role && roleSpecificItems[role as keyof typeof roleSpecificItems]) || [])]
  }

  const navItems = getNavItems()

  // Handle navigation and close sidebar on mobile
  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-full flex-shrink-0 flex flex-col bg-slate-800 text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0 md:w-20"
        } overflow-hidden`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Image
              src="/logo-transparent.png"
              alt="Air Georgia Logo"
              width={40}
              height={40}
              className="mr-2 flex-shrink-0"
            />
            {isSidebarOpen && <span className="text-lg font-semibold truncate">Air Georgia</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-slate-700 md:flex hidden"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-slate-700 ${
                  pathname === item.path ? "bg-slate-700" : ""
                } ${isSidebarOpen ? "px-3" : "px-2 justify-center"}`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                {isSidebarOpen && <span className="ml-3 truncate">{item.name}</span>}
              </Button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <Button
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-slate-700 ${
              isSidebarOpen ? "px-3" : "px-2 justify-center"
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2" aria-label="Toggle sidebar">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold capitalize truncate">{role} Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/logo-transparent.png" alt="User" />
                    <AvatarFallback>{role?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="capitalize">{role} Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${role}/profile`)}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/${role}/settings`)}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content with scrolling */}
        <main className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="content-container">{children}</div>
        </main>
      </div>
    </div>
  )
}
