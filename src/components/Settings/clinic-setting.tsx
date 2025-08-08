"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const clinicFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phòng khám phải có ít nhất 2 ký tự.",
  }),
  address: z.string().min(5, {
    message: "Địa chỉ phải có ít nhất 5 ký tự.",
  }),
  phone: z.string().min(10, {
    message: "Số điện thoại phải có ít nhất 10 ký tự.",
  }),
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  website: z
    .string()
    .url({
      message: "Website không hợp lệ.",
    })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  taxId: z.string().optional(),
})

type ClinicFormValues = z.infer<typeof clinicFormSchema>

// Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
const defaultValues: Partial<ClinicFormValues> = {
  name: "H-Dental Clinic",
  address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
  phone: "0901234567",
  email: "contact@hdental.com",
  website: "https://hdental.com",
  description: "Phòng khám nha khoa chuyên nghiệp với các dịch vụ nha khoa tổng quát, thẩm mỹ và implant.",
  taxId: "0123456789",
}

export function ClinicSettings() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues,
  })

  function onSubmit(data: ClinicFormValues) {
    setIsLoading(true)
    // Trong thực tế, gửi dữ liệu đến API
    setTimeout(() => {
      setIsLoading(false)
      toast("Cập nhật thành công" , {
        description: "Thông tin phòng khám đã được cập nhật.",
      })
    }, 1000)
  }

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">Thông tin chung</TabsTrigger>
        <TabsTrigger value="schedule">Lịch làm việc</TabsTrigger>
        <TabsTrigger value="branding">Thương hiệu</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên phòng khám</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên phòng khám" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập website" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã số thuế</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã số thuế" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả về phòng khám" className="resize-none" {...field} />
                      </FormControl>
                      <FormDescription>Mô tả ngắn gọn về phòng khám của bạn.</FormDescription>
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="schedule" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Lịch làm việc</h3>
                <p className="text-sm text-muted-foreground">Thiết lập giờ làm việc của phòng khám.</p>
              </div>

              <div className="space-y-4">
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h4 className="font-medium">{day}</h4>
                      {index < 6 ? (
                        <p className="text-sm text-muted-foreground">Mở cửa</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Đóng cửa</p>
                      )}
                    </div>
                    {index < 6 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          
                        </div>
                        <span>đến</span>
                        <div className="w-24">
                          
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button>Lưu lịch làm việc</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="branding" className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Thương hiệu</h3>
                <p className="text-sm text-muted-foreground">Quản lý logo và màu sắc thương hiệu của phòng khám.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Logo</h4>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-md border">
                      <Image src="/images/logo.png" alt="Logo" className="max-h-20 max-w-20" />
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        Thay đổi logo
                      </Button>
                      <p className="text-xs text-muted-foreground">Khuyến nghị: PNG hoặc SVG, 512x512px</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Màu sắc chính</h4>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary" />
                    <Input type="color" defaultValue="#0284c7" className="h-10 w-20 p-1" />
                    <Input type="text" defaultValue="#0284c7" className="w-28" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Màu sắc phụ</h4>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary" />
                    <Input type="color" defaultValue="#64748b" className="h-10 w-20 p-1" />
                    <Input type="text" defaultValue="#64748b" className="w-28" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Lưu thay đổi</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
