"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/ThemeProvider/theme-toggle"
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const activeLogout = async () => {
    try {
      // Navigate first
      router.replace("/login");
      // Then perform logout
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b border-sidebar-border bg-background px-4 sm:px-6">
      <div className="flex-1"></div>
      <div className="flex items-center gap-2 md:gap-4">
        <form className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm kiếm..." className="w-64 pl-8" />
        </form>
        <Button variant="outline" size="icon" className="relative border-sidebar-border">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </Button>
        <ModeToggle/>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback>BS</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{!user?.name ? user?.[0]?.name + " " + user?.[0]?.lastName : user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.[0]?.staff_email || user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={activeLogout}>Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
