"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Edit, Save, Calendar, User, DollarSign } from "lucide-react"
import { formatDateToDisplay } from "@/utils/date-utils"

interface TreatmentDetailsProps {
  treatment: any
}

export function TreatmentDetails({ treatment }: TreatmentDetailsProps) {
  const [editingDescription, setEditingDescription] = useState(false)
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (treatment?.treatment_description) {
      setDescription(treatment?.treatment_description)
    }
  }, [treatment])

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(cost)
  }

  return (
    <div className="space-y-6">
      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-medium">Mô Tả Điều Trị</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setEditingDescription(!editingDescription)}>
            {editingDescription ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {editingDescription ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết về điều trị"
              className="min-h-[150px]"
            />
          ) : (
            <p className={description ? "" : "text-muted-foreground"}>
              {description || "Không có mô tả chi tiết về điều trị này"}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Thông Tin Thời Gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ngày bắt đầu</p>
                <p className="font-medium">{formatDateToDisplay(treatment?.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày kết thúc</p>
                <p className="font-medium">{treatment?.end_date ? formatDateToDisplay(treatment?.end_date) : "Chưa hoàn thành"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="font-medium">
                  {treatment?.status === "schedule"
                    ? "Mới"
                    : treatment?.status === "progress"
                      ? "Đang điều trị"
                      : treatment?.status === "completed"
                        ? "Hoàn thành"
                        : "Hủy"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông Tin Người Liên Quan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Bệnh nhân</p>
              <p className="font-medium">
                {treatment?.patients?.name} ({treatment?.patients?.patient_code})
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bác sĩ phụ trách</p>
              <p className="font-medium">BS.{treatment?.staffManagement?.[0]?.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Thông Tin Chi Phí
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Loại điều trị</p>
              <p className="font-medium">{treatment?.services?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chi phí</p>
              <p className="font-medium">{formatCost(treatment?.price)}</p>
            </div>
            {treatment.medications && treatment.medications.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-2">Thuốc kê đơn</p>
                <ul className="list-disc pl-5 space-y-1">
                  {treatment.medications.map((med: any, index: number) => (
                    <li key={index}>
                      {med.name} ({med.dosage}) - {med.frequency} trong {med.duration}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
