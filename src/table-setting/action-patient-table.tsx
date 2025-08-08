"use client"

import React, { useState } from "react"
import { TableAction } from "../components/Table/table-actions"
import { Eye, Pencil, Trash2, FileText } from "lucide-react"
import { ModalType } from "@/types/modal"
import { useModal } from "@/contexts/modal-context"
import { useRouter } from "next/navigation"
import { patientsService } from "@/api/patients"
import { Patient } from "@/types/patient"
import { useQueryClient } from "@tanstack/react-query"

export const usePatientTableActions = (action?: (data: Patient) => void) => {
  const { openModal } = useModal()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeletePatient = async (id: string) => {
    try {
      setIsDeleting(true)
      await patientsService.updatePatientDocument(id, {
        isDeleted: true
      })
      await queryClient.refetchQueries({ queryKey: ['patient-documents', id] })
    } catch (error) {
      throw new Error("Error deleting patient")
    } finally {
      setIsDeleting(false)
    }
  }

  const patientTableActions: TableAction[] = [
    {
      label: "Xem chi tiết",
      icon: <Eye className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        action?.(data)
      }
    },
    {
      label: "Tạo điều trị",
      icon: <FileText className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        openModal(ModalType.TREATMENT, {
          data
        });
      }
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      actionType: "danger",
      onClick: (data: any) => {
        handleDeletePatient(data?.$id)
      },
      className: "text-red-600"
    },
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        router.push(`/patients/${data?.$id}/`)
      }
    }
  ]

  return {
    actions: patientTableActions,
    isDeleting
  }
}
