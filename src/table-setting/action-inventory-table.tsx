import { inventoryService } from "@/api/inventory";
import { TableAction } from "@/components/Table/table-actions";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { ModalType } from "@/types/modal";

export const useInventoryTableActions = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const handleDelete = async (id: string) => {
    try {
      await inventoryService.deleteInventoryDocuments(id);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    } catch (error) {
      throw new Error("Error deleting inventory");
    }
  };

  const inventoryTableActions: TableAction[] = [
    {
      label: "Chỉnh sửa",
      icon: <Edit className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => {
        openModal(ModalType.INVENTORY, {
          mode: "edit",
          data
        });
      },
    },
    {
      label: "Xóa",
      icon: <Trash2 className="h-4 w-4 text-red-600" />,
      actionType: "danger",
      onClick: (data: any) => {
        handleDelete(data?.$id);
      },
    },
  ];
  return inventoryTableActions;
};
