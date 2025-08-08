import { employeeService } from "@/api/employee";
import { TableAction } from "@/components/Table/table-actions";
import { Edit, PencilLine, Power } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/api/doctors";

export const getActionStaffTable = () => {
  const queryClient = useQueryClient();

  const handleActiveAccount = async (data: any) => {
    try {
      const payload = {
        active: true,
      }
      await doctorService.updateDoctorDocuments(data?.$id, payload);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi kích hoạt tài khoản");
    }
  };

  const handleDeactivateAccount = async (data: any) => {
    try {
        const payload = {
        active: false,
      }
      await doctorService.updateDoctorDocuments(data?.$id, payload);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi đóng tài khoản");
    }
  };

  const staffTableActions: TableAction[] = [
    {
      label: "Kích hoạt tài khoản",
      icon: <Power className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => handleActiveAccount(data),
      className: (data: any) => data.active === true ? "hidden" : "",
    },
    {
      label: "Đóng tài khoản",
      icon: <Power className="h-4 w-4" />,
      actionType: "basic",
      onClick: (data: any) => handleDeactivateAccount(data),
      className: (data: any) => data.active === false ? "hidden" : "",
    },
    {
      label: "Chỉnh sửa",
      icon: <Edit className="h-4 w-4" />,
      actionType: "basic",
      onClick: () => {
        console.log("Chỉnh sửa");
      },
    },
    {
      label: "Đổi mật khẩu",
      icon: <PencilLine className="h-4 w-4" />,
      actionType: "basic",
      onClick: () => {
        console.log("Chỉnh sửa");
      },
    },
  ];
  return staffTableActions;
};
