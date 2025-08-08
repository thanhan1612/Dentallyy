import { appointmentService } from "@/api/appointment";
import { TableAction } from "@/components/Table/table-actions";
import { ModalType } from "@/types/modal";
import { Clock, X, Check } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { useQueryClient } from "@tanstack/react-query";

export const useAppointmentTableActions = () => {
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointmentDocuments(id, {
        status: "cancel",
      });
      await queryClient.refetchQueries({ queryKey: ['appointment-documents'] });
    } catch (error) {
      throw new Error("Error canceling appointment");
    }
  };

  const confirmAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointmentDocuments(id, {
        status: "confirm",
      });
      await queryClient.refetchQueries({ queryKey: ['appointment-documents'] });
    } catch (error) {
      throw new Error("Error confirming appointment");
    }
  };

  const appointmentTabAction: TableAction[] = [
    {
      label: "Xác nhận",
      icon: <Check className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        confirmAppointment(data?.$id);
      },
      className: (data: any) => data?.status === "confirm" ? "hidden" : ""
    },
    {
      label: "Đổi lịch",
      icon: <Clock className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        openModal(ModalType.APPOINTMENT, {
          appointmentId: data,
        });
      },
    },
    {
      label: "Hủy",
      icon: <X className="h-4 w-4 text-red-600" />,
      actionType: "danger",
      onClick: (data: any) => {
        cancelAppointment(data?.$id);
      },
    },
  ];

  return appointmentTabAction;
};
