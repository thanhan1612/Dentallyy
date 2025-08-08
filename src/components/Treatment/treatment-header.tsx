"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, User } from "lucide-react"
import Link from "next/link"
import { useModal } from "@/contexts/modal-context"
import { ModalType } from "@/types/modal"

interface TreatmentHeaderProps {
  treatment: any
}

export function TreatmentHeader({ treatment }: TreatmentHeaderProps) {
  const { openModal } = useModal()

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(cost)
  }

  const handleEdit = () => {
    openModal(ModalType.TREATMENT, {
      treatmentId: treatment?.$id,
    })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{treatment?.treatment_name}</h2>
                <Badge
                  variant="default"
                >
                  {treatment?.status === "schedule"
                    ? "Mới"
                    : treatment?.status === "progress"
                      ? "Đang điều trị"
                      : treatment?.status === "completed"
                        ? "Hoàn thành"
                        : "Hủy"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Loại: {treatment?.services?.name} | Chi phí: {formatCost(treatment?.price)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href={`/patients/${treatment?.patients?.$id}/personal-info`}>
                <User className="mr-2 h-4 w-4" />
                Xem bệnh nhân
              </Link>
            </Button>
            <Button onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}