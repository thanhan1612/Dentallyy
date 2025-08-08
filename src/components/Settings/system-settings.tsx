"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)

  const handleSaveSettings = () => {
    setIsLoading(true)
    // Trong thực tế, gửi dữ liệu đến API
    setTimeout(() => {
      setIsLoading(false)
      toast("Cập nhật thành công" , {
        description: "Cài đặt hệ thống đã được cập nhật.",
      })
    }, 1000)
  }

  const handleBackup = () => {
    setBackupLoading(true)
    // Trong thực tế, gọi API để tạo bản sao lưu
    setTimeout(() => {
      setBackupLoading(false)
      toast("Sao lưu thành công" , {
        description: "Dữ liệu hệ thống đã được sao lưu.",
      })
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cài đặt hệ thống</h3>
        <p className="text-sm text-muted-foreground">Quản lý cài đặt chung của hệ thống.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Ngôn ngữ và khu vực</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Ngôn ngữ</Label>
              <Select defaultValue="vi">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Múi giờ</Label>
              <Select defaultValue="asia_ho_chi_minh">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Chọn múi giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia_ho_chi_minh">(GMT+7) Asia/Ho_Chi_Minh</SelectItem>
                  <SelectItem value="asia_bangkok">(GMT+7) Asia/Bangkok</SelectItem>
                  <SelectItem value="asia_singapore">(GMT+8) Asia/Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Định dạng</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date-format">Định dạng ngày</Label>
              <Select defaultValue="dd/mm/yyyy">
                <SelectTrigger id="date-format">
                  <SelectValue placeholder="Chọn định dạng ngày" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Đơn vị tiền tệ</Label>
              <Select defaultValue="vnd">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vnd">VND (₫)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Bảo mật</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Xác thực hai yếu tố</Label>
                <p className="text-sm text-muted-foreground">Yêu cầu xác thực hai yếu tố cho tất cả người dùng.</p>
              </div>
              <Switch id="2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="session-timeout">Thời gian hết phiên</Label>
                <p className="text-sm text-muted-foreground">Tự động đăng xuất sau thời gian không hoạt động.</p>
              </div>
              <div className="flex items-center gap-2">
                <Input id="session-timeout" type="number" defaultValue="30" className="w-20" />
                <span className="text-sm">phút</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Sao lưu và phục hồi</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Sao lưu tự động</p>
                <p className="text-sm text-muted-foreground">Tự động sao lưu dữ liệu hàng ngày.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Sao lưu thủ công</p>
                <p className="text-sm text-muted-foreground">Tạo bản sao lưu dữ liệu ngay lập tức.</p>
              </div>
              <Button variant="outline" onClick={handleBackup} disabled={backupLoading}>
                {backupLoading ? "Đang sao lưu..." : "Sao lưu ngay"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Nâng cao</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Chế độ bảo trì</p>
                <p className="text-sm text-muted-foreground">Kích hoạt chế độ bảo trì hệ thống.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Xóa tất cả dữ liệu</p>
                <p className="text-sm text-muted-foreground">Xóa tất cả dữ liệu trong hệ thống.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Xóa dữ liệu</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu trong hệ thống sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Xóa tất cả dữ liệu
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  )
}
