"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { toast } from "sonner"

// Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
const users = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "doctor.a@hdental.com",
    role: "admin",
    status: "active",
    lastActive: "2023-11-15T10:30:00",
    avatar: "",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "nurse.b@hdental.com",
    role: "staff",
    status: "active",
    lastActive: "2023-11-15T09:45:00",
    avatar: "",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "receptionist.c@hdental.com",
    role: "staff",
    status: "active",
    lastActive: "2023-11-14T16:20:00",
    avatar: "",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "assistant.d@hdental.com",
    role: "staff",
    status: "inactive",
    lastActive: "2023-11-10T11:15:00",
    avatar: "",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "doctor.e@hdental.com",
    role: "doctor",
    status: "active",
    lastActive: "2023-11-15T08:30:00",
    avatar: "",
  },
]

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-primary">Quản trị viên</Badge>
    case "doctor":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
          Bác sĩ
        </Badge>
      )
    case "staff":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          Nhân viên
        </Badge>
      )
    default:
      return <Badge variant="outline">Khác</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
          Hoạt động
        </Badge>
      )
    case "inactive":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
          Không hoạt động
        </Badge>
      )
    default:
      return <Badge variant="outline">Không xác định</Badge>
  }
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddUser = () => {
    setIsAddUserDialogOpen(false)
    toast("Thêm người dùng thành công" , {
      description: "Người dùng mới đã được thêm vào hệ thống.",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Quản lý người dùng</h3>
        <p className="text-sm text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>Nhập thông tin để tạo tài khoản người dùng mới.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right text-sm font-medium">
                  Họ và tên
                </label>
                <Input id="name" placeholder="Nhập họ và tên" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right text-sm font-medium">
                  Email
                </label>
                <Input id="email" placeholder="Nhập email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="role" className="text-right text-sm font-medium">
                  Vai trò
                </label>
                <select
                  id="role"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="doctor">Bác sĩ</option>
                  <option value="staff">Nhân viên</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAddUser}>Thêm người dùng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hoạt động gần đây</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  {new Date(user.lastActive).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                      <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                      <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Đặt lại mật khẩu</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Vô hiệu hóa tài khoản</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
