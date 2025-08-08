"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  ClipboardList,
  Home,
  Package,
  PieChart,
  Settings,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  UserCog,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "../../contexts/sidebar-context"
import "../../styles/sidebar.css"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { getRoleFromLabels } from "@/utils/role-from-label"

type UserRole = "super_admin" | "branch_admin" | "staff" | "doctor"

interface MenuItem {
  title: string
  href: string
  icon: any
  roles: UserRole[]
}

const menuItems: MenuItem[] = [
  {
    title: "Tổng Quan",
    href: "/",
    icon: Home,
    roles: ["super_admin", "branch_admin"]
  },
  {
    title: "Bệnh Nhân",
    href: "/patients",
    icon: Users,
    roles: ["super_admin", "branch_admin", "doctor"]
  },
  {
    title: "Lịch Hẹn",
    href: "/appointments",
    icon: Calendar,
    roles: ["super_admin", "branch_admin", "doctor"]
  },
  {
    title: "Kế Hoạch Điều Trị",
    href: "/treatments",
    icon: ClipboardList,
    roles: ["super_admin", "branch_admin", "doctor"]
  },
  {
    title: "Thanh Toán",
    href: "/payments",
    icon: Wallet,
    roles: ["super_admin", "branch_admin"]  
  },
  {
    title: "Kho Vật Tư",
    href: "/inventory",
    icon: Package,
    roles: ["super_admin", "branch_admin"]
  },
  {
    title: "Báo Cáo",
    href: "/reports",
    icon: PieChart,
    roles: ["super_admin", "branch_admin"]
  },
  {
    title: "Nhân Viên",
    href: "/staff",
    icon: UserCog,
    roles: ["super_admin", "branch_admin"]
  },
  {
    title: "Dịch Vụ",
    href: "/services",
    icon: List,
    roles: ["super_admin", "branch_admin"]
  },
  {
    title: "Cài Đặt",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin", "branch_admin", "doctor", "staff"]
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isOpen, isMobile, toggleSidebar, setIsOpen } = useSidebar()
  const { user } = useAuth()

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  // Map labels to roles

  const userRole = user?.labels ? getRoleFromLabels(user.labels) : user?.[0]?.role;

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className={cn("h-full bg-sidebar border-r border-sidebar-border flex flex-col", "w-full")}>
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", isOpen ? "px-4" : "px-2")}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "relative flex items-center justify-center",
            isOpen ? "w-[40px] h-[40px]" : "w-[24px] h-[24px]",
            "transition-all duration-300"
          )}>
            <Image 
              src="/logo.png" 
              alt="H-Dental Logo" 
              width={isOpen ? 40 : 24} 
              height={isOpen ? 40 : 24} 
              className="object-contain"
              priority
            />
          </div>
          {(isOpen || isMobile) && <h1 className="text-xl font-bold">H-Dental</h1>}
        </div>
        <div className="flex-1"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className={cn(
            "ml-auto transition-transform duration-300 hover:scale-105",
            isOpen ? "size-9" : "size-8"
          )}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                "transition-colors duration-200",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !isOpen && !isMobile && "justify-center px-2",
              )}
              prefetch={false}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-colors duration-200",
                pathname === item.href ? "" : "text-sidebar-foreground/70"
              )} />
              {(isOpen || isMobile) && <span className="ml-3">{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4 border-sidebar-border">
        {(isOpen || isMobile) && <div className="text-xs text-muted-foreground">H-Dental Management v1.0</div>}
      </div>
    </div>
  )
}
