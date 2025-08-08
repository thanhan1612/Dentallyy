import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - Hypertek Dental Management",
  description: "Đặt lại mật khẩu quản trị hệ thống",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-2">
                <KeyRound className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Đặt lại mật khẩu</CardTitle>
            <CardDescription>Tạo mật khẩu mới cho tài khoản quản trị của bạn</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-medium">
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input id="password" type="password" className="pl-10" />
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Mật khẩu phải có ít nhất 12 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="font-medium">
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input id="confirmPassword" type="password" className="pl-10" />
                <div className="absolute left-3 top-3 text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Đặt lại mật khẩu
            </Button>
          </CardFooter>
        </Card>
        <div className="text-center text-sm text-muted-foreground">
          <p>Liên hệ bộ phận IT nếu bạn gặp sự cố khi đặt lại mật khẩu</p>
          <p>© {new Date().getFullYear()} Hypertek Dental Management</p>
        </div>
      </div>
    </div>
  )
}
