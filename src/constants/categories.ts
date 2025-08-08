export interface Category {
  id: string;
  label: string;
  value: string;
}

export const INVENTORY_CATEGORIES: Category[] = [
    { id: "all", label: "Tất cả", value: "all" },
    { id: "Vật tư tiêu hao", label: "Vật tư tiêu hao", value: "consumables" },
    { id: "Thiết bị", label: "Thiết bị", value: "equipment" },
    { id: "Thuốc", label: "Thuốc", value: "medicine" },
    { id: "Dụng cụ", label: "Dụng cụ", value: "tools" },
    { id: "Implant", label: "Implant", value: "implant" },
];

export const ROLES: Category[] = [
    { id: "all", label: "Tất cả", value: "all" },
    { id: "branch_admin", label: "Quản trị viên chi nhánh", value: "branch_admin" },
    { id: "doctor", label: "Bác sĩ", value: "doctor" },
    { id: "staff", label: "Nhân viên", value: "staff" },
];