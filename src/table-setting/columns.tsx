"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TableActions } from "@/components/Table/table-actions";
import { usePatientTableActions } from "@/table-setting/action-patient-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppointmentTableActions } from "./action-appointment-table";
import { useAuth } from "@/contexts/AuthContext";
import { useTreatmentTableActions } from "./action-treatment-table";
import { formatDateToDisplay } from "@/utils/date-utils";
import ageCalculate from "@/utils/age-calculate";
import { usePaymentTableActions } from "./action-payment-table";
import { useRouter } from "next/navigation";
import { useInventoryTableActions } from "./action-inventory-table";
import { Package, PenTool, Pill, Stethoscope } from "lucide-react";
import { useServiceTableActions } from "./action-service-table";
import { getActionStaffTable } from "./action-staff-table";
import { getStatusText } from "@/utils/status-text";
export const patientColumns: ColumnDef<any>[] = [
  {
    accessorKey: "patient_code",
    header: "Mã BN",
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "name",
    header: "Tên Bệnh Nhân",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={patient.avatar} />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{patient.name}</span>
            <span className="text-sm text-muted-foreground">
              {patient.phone}
            </span>
          </div>
        </div>
      );
    },
    meta: {
      className: "w-[150px]",
    },
  },
  {
    accessorKey: "age",
    header: "Tuổi",
    cell: ({ row }) => {
      const patient = row.original;
      return <span>{patient?.dob === null ? "N/A" : ageCalculate(patient?.dob)}</span>;
    },
    meta: {
      className: "w-[60px]",
    },
  },
  {
    accessorKey: "gender",
    header: "Giới Tính",
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "status",
    header: "Trạng Thái",
    meta: {
      className: "w-[80px]",
    },
    cell: ({ row }) => {
      const { display } = getLatestStatus(row.original.treatment || []);
      return display;
    },
    filterFn: (row, id, value) => {
      const { raw: statusRaw } = getLatestStatus(row.original.treatment || []);
      const map: Record<string, string> = {
        Mới: "schedule",
        "Đang điều trị": "process",
        "Hoàn thành": "completed",
        Hủy: "cancel",
      };
      if (!statusRaw) return value === "new" || value === "Mới";
      return statusRaw === map[value] || statusRaw === value;
    },
  },
  {
    accessorKey: "lastVisit",
    header: "Lần Khám Gần Nhất",
    meta: {
      className: "w-[100px]",
    },
  },
  {
    accessorKey: "nextAppointment",
    header: "Lịch Hẹn Tiếp Theo",
    meta: {
      className: "w-[100px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    meta: {
      className: "w-[100px]",
    },
  },
];

export const getAppointmentColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "appointment_code",
    header: "Mã Lịch Hẹn",
    meta: {
      className: "w-[130px]",
    },
  },
  {
    accessorKey: "patient_name",
    header: "Bệnh Nhân",
    meta: {
      className: "w-[200px]",
    },
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={appointment?.patients?.avatar || ""} />
            <AvatarFallback>
              {appointment?.patients?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{appointment?.patients?.name}</span>
            <span className="text-sm text-muted-foreground">
              {appointment?.patients?.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "service",
    header: "Dịch Vụ",
    cell: ({ row }) => {
      const appointment = row.original;
      return <span>{appointment?.services?.[0]?.name}</span>;
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "appointment_time",
    header: "Thời Gian",
    meta: {
      className: "w-[200px]",
    },
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="flex gap-4">
          <span>
            {formatDateToDisplay(appointment?.appointment_date)} -{" "}
            {appointment?.appointment_time_range}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "doctor",
    header: "Bác Sĩ",
    cell: ({ row }) => {
      const appointment = row.original;
      return <span>BS.{appointment?.staffManagement?.name}</span>;
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "status",
    header: "Trạng Thái",
    cell: ({ row }) => {
      const appointment = row.original;
      return <span>{getStatusText(appointment?.status)}</span>;
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    cell: ({ row }) => {
      const actions = useAppointmentTableActions();
      return <TableActions data={row.original} actions={actions} />;
    },
    meta: {
      className: "w-[100px]",
    },
  },
];

export const treatmentColumns: ColumnDef<any>[] = [
  {
    accessorKey: "treatment_code",
    header: "Mã ĐT",
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "patients.name",
    header: "Bệnh Nhân",
    cell: ({ row }) => {
      const patient = row?.original?.patients;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={patient?.avatar} />
            <AvatarFallback>{patient?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{patient?.name}</span>
          </div>
        </div>
      );
    },
    meta: {
      className: "w-[300px]",
    },
  },
  {
    accessorKey: "treatment_name",
    header: "Điều Trị",
    meta: {
      className: "w-[300px]",
    },
  },
  {
    accessorKey: "treatment_id",
    header: "Loại",
    cell: ({ row }) => {
      const treatment = row?.original?.services;
      return <span>{treatment?.name}</span>;
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "doctor_name",
    header: "Bác Sĩ",
    cell: ({ row }) => {
      const doctor = row?.original?.staffManagement;
      return <span>BS.{doctor?.[0]?.name}</span>;
    },
    meta: {
      className: "w-[150px]",
    },
  },
  {
    accessorKey: "start_date",
    header: "Ngày Bắt Đầu",
    cell: ({ row }) => {
      const startDate = row?.original;
      return <span>{formatDateToDisplay(startDate?.start_date)}</span>;
    },
    meta: {
      className: "w-[140px]",
    },
  },
  {
    accessorKey: "status",
    header: "Trạng Thái",
    cell: ({ row }) => {
      const status = row?.original?.status;
      return <span>
        {getStatusText(status)}
        </span>;
    },
    meta: {
      className: "w-[140px]",
    },
  },
  {
    accessorKey: "price",
    header: "Chi Phí",
    cell: ({ row }) => {
      const treatment = row?.original?.price;
      return <span>{treatment?.toLocaleString("vi-VN")} VNĐ</span>;
    },
    meta: {
      className: "w-[150px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    cell: ({ row }) => {
      const actions = useTreatmentTableActions();
      return <TableActions data={row.original} actions={actions} />;
    },
    meta: {
      className: "w-[100px]",
    },
  },
];

export const paymentColumns: ColumnDef<any>[] = [
  {
    accessorKey: "invoice_num",
    header: "Mã Hóa Đơn",
    meta: {
      className: "w-[100px]",
    },
  },
  {
    accessorKey: "patient",
    header: "Bệnh Nhân",
    cell: ({ row }) => {
      const info = row.original;
      const router = useRouter();
      return (
        <div
          className="cursor-pointer hover:text-primary"
          onClick={() =>
            router.push(`/patients/${info?.patient?.$id}/personal-info`)
          }
        >
          <span>{info?.patients?.name}</span>
        </div>
      );
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "treatment_name",
    header: "Điều Trị",
    cell: ({ row }) => {
      const info = row.original;
      const router = useRouter();
      return (
        <div
          className="cursor-pointer hover:text-primary"
          onClick={() => router.push(`/treatments/${info?.treatment_id}`)}
        >
          <span>{info?.treatment_name}</span>
        </div>
      );
    },
    meta: {
      className: "w-[300px]",
    },
  },
  {
    accessorKey: "date",
    header: "Ngày thanh toán",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{formatDateToDisplay(info?.date)}</span>;
    },
    meta: {
      className: "w-[140px]",
    },
  },
  {
    accessorKey: "cost",
    header: "Chi Phí",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{info?.cost?.toLocaleString("vi-VN")} VNĐ</span>;
    },
    meta: {
      className: "w-[140px]",
    },
  },
  {
    accessorKey: "paid",
    header: "Đã thanh toán",
    cell: ({ row }) => {
      const info = row.original;
      let totalPaid = 0;
      try {
        const paidData = Array.isArray(info?.paid) ? info?.paid : [];
        if (paidData) {
          totalPaid = paidData.reduce((sum: number, payment: any) => {
            const paymentData = JSON.parse(payment);
            return sum + Number(paymentData?.paid_amount || 0);
          }, 0);
        }
      } catch (error) {
        console.error('Error parsing paid data:', error);
      }
      return <span>{totalPaid.toLocaleString("vi-VN")} VNĐ</span>;
    },
    meta: {
      className: "w-[140px]",
    },
  },
  {
    accessorKey: "status",
    header: "Trạng Thái",
    cell: ({ row }) => {
      const info = row.original;
      let totalPaid = 0;
      try {
        const paidData = Array.isArray(info?.paid) ? info?.paid : [];
        if (paidData) {
          totalPaid = paidData.reduce((sum: number, payment: any) => {
            const paymentData = JSON.parse(payment);
            return sum + Number(paymentData?.paid_amount || 0);
          }, 0);
        }
      } catch (error) {
        console.error('Error parsing paid data:', error);
      }

      if (totalPaid < info?.cost && totalPaid > 0) {
        return "Còn nợ";
      } else if (totalPaid === info?.cost) {
        return "Đã thanh toán";
      } else if (totalPaid === 0) {
        return "Chưa thanh toán";
      } else {
        return "Đã thanh toán";
      }
    },
    meta: {
      className: "w-[100px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    cell: ({ row }) => {
      const actions = usePaymentTableActions();
      return <TableActions data={row.original} actions={actions} />;
    },
    meta: {
      className: "w-[100px]",
    },
  },
];

export const inventoryColumns: ColumnDef<any>[] = [
  {
    accessorKey: "sku_code",
    header: "Tên Vật Tư",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <div className="flex gap-2 flex-col">
          <span>{info?.name}</span>
          <span className="text-sm text-muted-foreground">
            SKU: {info?.sku_code}
          </span>
        </div>
      );
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "category",
    header: "Danh mục",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <div className="flex gap-2 items-center">
          <div className="w-4 h-4">{getCategoryIcon(info?.category)}</div>
          <span>{getCategoryLabel(info?.category)}</span>
        </div>
      );
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "amount",
    header: "Số lượng",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <div className="flex items-center gap-2">
          <span>{info?.amount?.toLocaleString()}</span>
          <span>{info?.unit}</span>
        </div>
      );
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "price",
    header: "Đơn giá",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{info?.price?.toLocaleString()}</span>;
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      const actions = useInventoryTableActions();
      return <TableActions data={row.original} actions={actions} />;
    },
    meta: {
      className: "w-[200px]",
    },
  },
];

export const serviceColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Tên Dịch Vụ",
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    meta: {
      className: "w-[150px]",
    },
  },
  {
    accessorKey: "duration",
    header: "Thời gian",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{info?.duration} phút</span>;
    },
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "price",
    header: "Giá",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{info?.cost?.toLocaleString()} VNĐ</span>;
    },
    meta: {
      className: "w-[80px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    cell: ({ row }) => {
      const actions = useServiceTableActions();
      return <TableActions data={row.original} actions={actions} />;
    },
    meta: {
      className: "w-[20px]",
    },
  },
];

export const employeeColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Tên",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <div className="flex items-center gap-1">
          <span>{info?.lastName}</span>
          <span>{info?.name}</span>
        </div>
      );
    },
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{getRole(info?.role)}</span>;
    },
    meta: {
      className: "w-[80px]",
    },
  },
  {
    accessorKey: "gender",
    header: "Giới tính",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{getGender(info?.gender)}</span>;
    },
    meta: {
      className: "w-[120px]",
    },
  },
  {
    accessorKey: "dob",
    header: "Ngày sinh",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{ info?.dob ? formatDateToDisplay(info?.dob) : "Không có"}</span>;
    },
    meta: {
      className: "w-[120px]",
    },
  },
  {
    accessorKey: "staff_email",
    header: "Email",
    meta: {
      className: "w-[300px]",
    },
  },
  {
    accessorKey: "staff_phone",
    header: "Số điện thoại",
    meta: {
      className: "w-[120px]",
    },
  },
  {
    accessorKey: "address",
    header: "Địa chỉ",
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "specialty",
    header: "Chuyên khoa",
    meta: {
      className: "w-[200px]",
    },
  },
  {
    accessorKey: "staff_description",
    header: "Mô tả",
    meta: {
      className: "w-[300px]",
    },
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <span>{info?.active === "true" ? "Hoạt động" : "Không hoạt động"}</span>
      );
    },
    meta: {
      className: "w-[120px]",
    },
  },
  {
    id: "actions",
    header: "Hành Động",
    meta: {
      className: "w-[120px]",
    },
    cell: ({ row }) => {
      const actions = getActionStaffTable();
      return <TableActions data={row.original} actions={actions} />;
    },
  },
];

export const dashboardRecentAppointmentColumns: ColumnDef<any>[] = [
  {
    accessorKey: "patients.name",
    header: "Bệnh Nhân",
  },
  {
    accessorKey: "services.name",
    header: "Dịch vụ",
  },
  {
    accessorKey: "appointment_date",
    header: "Ngày & Giờ",
    cell: ({ row }) => {
      const info = row.original;
      return (
        <span>
          {formatDateToDisplay(info?.appointment_date)} -{" "}
          {info?.appointment_time_range}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const info = row.original;
      return <span>{getStatusText(info?.status)}</span>;
    },
  },
  {
    accessorKey: "actions",
    header: "Hành động",
    cell: () => {
      const router = useRouter();
      return (
        <div
          className="cursor-pointer"
          onClick={() => {
            router.push(`/appointments`);
          }}
        >
          Chi tiết
        </div>
      );
    },
  },
];

function getLatestStatus(treatments: any[]) {
  if (!treatments || treatments.length === 0)
    return { display: "Mới", raw: undefined };
  
  const now = new Date();
  const sorted = [...treatments].sort((a, b) => {
    const dateA = new Date(a?.start_date);
    const dateB = new Date(b?.start_date);
    return dateB.getTime() - dateA.getTime();
  });

  const statusRaw = sorted[0]?.status;
  let display = statusRaw;
  if (statusRaw === "schedule") display = "Mới";
  if (statusRaw === "process") display = "Đang điều trị";
  if (statusRaw === "completed") display = "Hoàn thành";
  if (statusRaw === "cancel") display = "Hủy";
  
  return { display, raw: statusRaw };
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "consumables":
      return <Package className="w-4 h-4" />;
    case "medicine":
      return <Pill className="w-4 h-4" />;
    case "tools":
      return <PenTool className="w-4 h-4" />;
    case "equipment":
      return <Stethoscope className="w-4 h-4" />;
    case "implant":
      return <Package className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "consumables":
      return "Vật tư tiêu hao";
    case "medicine":
      return "Thuốc";
    case "tools":
      return "Dụng cụ";
    case "equipment":
      return "Thiết bị";
    case "implant":
      return "Implant";
    default:
      return "Vật tư tiêu hao";
  }
}

export function getRole(role: string) {
  switch (role) {
    case "branch_admin":
      return "Quản trị viên chi nhánh";
    case "doctor":
      return "Bác sĩ";
    case "staff":
      return "Nhân viên";
    default:
      return "Nhân viên";
  }
}

function getGender(gender: string) {
  switch (gender) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Không xác định";
  }
}