import { TableAction } from "@/components/Table/table-actions";
import { ModalType } from "@/types/modal";
import { Pencil, Trash } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { useQueryClient } from "@tanstack/react-query";
import { serviceService } from "@/api/service";

export const useServiceTableActions = () => {
    const { openModal } = useModal();
    const queryClient = useQueryClient();


    const handleDelete = async (data: any) => {
        try {
            await serviceService.deleteServiceDocuments(data?.$id);
            queryClient.invalidateQueries({ queryKey: ['services'] });
        } catch (error) {
            throw new Error("Có lỗi xảy ra khi xóa dịch vụ");
        }
    }
    const serviceTabAction: TableAction[] = [
        {
            label: "Chỉnh sửa",
            icon: <Pencil className="h-4 w-4" />,
            actionType: "basic",
            onClick: (data: any) => {
                openModal(ModalType.SERVICE, {
                    data
                });
            }
        },
        {
            label: "Xóa",
            icon: <Trash className="h-4 w-4 text-red-600" />,
            actionType: "danger",
            onClick: (data: any) => {
                handleDelete(data);
            }
        }
    ]

    return serviceTabAction;
}