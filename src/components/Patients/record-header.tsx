"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Link from "next/link"

interface RecordHeaderProps {
  record: any
}

export function RecordHeader({ record }: RecordHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={record?.name} />
              <AvatarFallback>{record?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{record?.name}</h2>
                {/* <Badge
                  variant={
                    record?.status === "active"
                      ? "default"
                      : record?.status === "pending"
                        ? "outline"
                        : record?.status === "completed"
                          ? "secondary"
                          : "destructive"
                  }
                >
                  {record?.status === "active"
                    ? "Đang Điều Trị"
                    : record?.status === "pending"
                      ? "Chờ Xử Lý"
                      : record?.status === "completed"
                        ? "Hoàn Thành"
                        : "Lưu Trữ"}
                </Badge> */}
              </div>
              <p className="text-muted-foreground">
                Mã bệnh nhân: {record?.patient_code} | Bác sĩ phụ trách: {record?.staffManagement?.[0]?.name ? `BS. ${record?.staffManagement?.[0]?.name}` : "N/A"}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href={`/patients/${record?.$id}/personal-info`}>Xem hồ sơ bệnh nhân</Link>
            </Button>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
