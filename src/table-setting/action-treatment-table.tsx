import { TableAction } from "@/components/Table/table-actions"
import { useModal } from "@/contexts/modal-context"
import { ModalType } from "@/types/modal"
import { Eye, Pencil, Trash, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { treatmentService } from "@/api/treatment"

export const useTreatmentTableActions = () => {
  const router = useRouter();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const handleDelete = async (data: any) => {
    try {
      await treatmentService.updateTreatmentDocument(data.id, {
        isDeleted: true
      });
      queryClient.refetchQueries({ queryKey: ['treatments'] });
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xóa điều trị");
    }
  }

  const treatmentTabAction: TableAction[] = [
    {
      label: "Xem chi tiết",
      icon: <Eye className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        router.push(`/treatments/${data?.$id}`)
      }
    },
    {
      label: "Xem bệnh nhân",
      icon: <User className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        router.push(`/patients/${data?.patients?.$id}/personal-info`)
      }
    },
    {
      label: "Chỉnh sửa",
      icon: <Pencil className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        openModal(ModalType.TREATMENT, {
          treatment: data,
          onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['treatment-documents'] })
          }
        })
      },
      className: (data: any) => data?.status === "completed" ? "hidden" : ""
    },
    {
      label: "Xóa",
      icon: <Trash className="h-4 w-4" />,
      actionType: "danger",
      onClick: (data: any) => {
        handleDelete(data);
      },
      className: (data: any) => data?.status === "completed" ? "hidden" : ""
    }
  ]

  return treatmentTabAction
}

