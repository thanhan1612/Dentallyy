"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = () => {
    setIsLoading(true)
    // Trong thực tế, gửi dữ liệu đến API
    setTimeout(() => {
      setIsLoading(false)
      toast("Cập nhật thành công" , {
        description: "Cài đặt thông báo đã được cập nhật.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cài đặt thông báo</h3>
        <p className="text-sm text-muted-foreground">Quản lý cách bạn nhận thông báo từ hệ thống.</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="app">Ứng dụng</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo qua Email</CardTitle>
              <CardDescription>Quản lý các thông báo được gửi đến email của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-appointments" className="flex flex-col space-y-1">
                  <span>Lịch hẹn</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Nhận thông báo khi có lịch hẹn mới hoặc thay đổi.
                  </span>
                </Label>
                <Switch id="email-appointments" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-reminders" className="flex flex-col space-y-1">
                  <span>Nhắc nhở</span>
                  <span className="font-normal text-sm text-muted-foreground">Nhận email nhắc nhở trước lịch hẹn.</span>
                </Label>
                <Switch id="email-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-marketing" className="flex flex-col space-y-1">
                  <span>Tiếp thị</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Nhận thông tin về khuyến mãi và dịch vụ mới.
                  </span>
                </Label>
                <Switch id="email-marketing" />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-system" className="flex flex-col space-y-1">
                  <span>Hệ thống</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Nhận thông báo về cập nhật hệ thống và bảo trì.
                  </span>
                </Label>
                <Switch id="email-system" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo trong ứng dụng</CardTitle>
              <CardDescription>Quản lý các thông báo hiển thị trong ứng dụng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="app-appointments" className="flex flex-col space-y-1">
                  <span>Lịch hẹn</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Hiển thị thông báo khi có lịch hẹn mới hoặc thay đổi.
                  </span>
                </Label>
                <Switch id="app-appointments" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="app-tasks" className="flex flex-col space-y-1">
                  <span>Công việc</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Hiển thị thông báo về công việc được giao.
                  </span>
                </Label>
                <Switch id="app-tasks" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="app-messages" className="flex flex-col space-y-1">
                  <span>Tin nhắn</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Hiển thị thông báo khi có tin nhắn mới.
                  </span>
                </Label>
                <Switch id="app-messages" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="app-sound" className="flex flex-col space-y-1">
                  <span>Âm thanh</span>
                  <span className="font-normal text-sm text-muted-foreground">Phát âm thanh khi có thông báo mới.</span>
                </Label>
                <Switch id="app-sound" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo qua SMS</CardTitle>
              <CardDescription>Quản lý các thông báo được gửi qua tin nhắn SMS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sms-appointments" className="flex flex-col space-y-1">
                  <span>Lịch hẹn</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Nhận SMS khi có lịch hẹn mới hoặc thay đổi.
                  </span>
                </Label>
                <Switch id="sms-appointments" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sms-reminders" className="flex flex-col space-y-1">
                  <span>Nhắc nhở</span>
                  <span className="font-normal text-sm text-muted-foreground">Nhận SMS nhắc nhở trước lịch hẹn.</span>
                </Label>
                <Switch id="sms-reminders" defaultChecked />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="sms-marketing" className="flex flex-col space-y-1">
                  <span>Tiếp thị</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Nhận thông tin về khuyến mãi và dịch vụ mới qua SMS.
                  </span>
                </Label>
                <Switch id="sms-marketing" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  )
}
