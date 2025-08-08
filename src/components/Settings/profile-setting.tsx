"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { toast } from "sonner"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  phone: z.string().min(10, {
    message: "Số điện thoại phải có ít nhất 10 ký tự.",
  }),
  position: z.string().min(2, {
    message: "Vị trí phải có ít nhất 2 ký tự.",
  }),
  bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
const defaultValues: Partial<ProfileFormValues> = {
  name: "Bác sĩ Nguyễn Văn A",
  email: "doctor.a@hdental.com",
  phone: "0901234567",
  position: "Bác sĩ nha khoa chính",
  bio: "Bác sĩ nha khoa với hơn 10 năm kinh nghiệm trong lĩnh vực nha khoa thẩm mỹ và implant.",
}

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    // Trong thực tế, gửi dữ liệu đến API
    setTimeout(() => {
      setIsLoading(false)
      toast("Cập nhật thành công" , {
        description: "Thông tin hồ sơ của bạn đã được cập nhật.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hồ sơ cá nhân</h3>
        <p className="text-sm text-muted-foreground">Cập nhật thông tin hồ sơ cá nhân của bạn.</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="" alt="Avatar" />
          <AvatarFallback>NA</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h4 className="font-medium">Ảnh đại diện</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Thay đổi
            </Button>
            <Button variant="ghost" size="sm">
              Xóa
            </Button>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập họ và tên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập vị trí" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới thiệu</FormLabel>
                <FormControl>
                  <Textarea placeholder="Nhập thông tin giới thiệu về bản thân" className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Thông tin này sẽ được hiển thị công khai.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Bảo mật</h3>
          <p className="text-sm text-muted-foreground">Cập nhật mật khẩu và thiết lập bảo mật cho tài khoản của bạn.</p>
        </div>
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium">Thay đổi mật khẩu</h4>
            <p className="text-sm text-muted-foreground">Cập nhật mật khẩu đăng nhập của bạn.</p>
          </div>
          <Button variant="outline">Thay đổi mật khẩu</Button>
        </div>
        <div className="flex justify-between">
          <div>
            <h4 className="font-medium">Xác thực hai yếu tố</h4>
            <p className="text-sm text-muted-foreground">Thêm lớp bảo mật bổ sung cho tài khoản của bạn.</p>
          </div>
          <Button variant="outline">Thiết lập</Button>
        </div>
      </div>
    </div>
  )
}
