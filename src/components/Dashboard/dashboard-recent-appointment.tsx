import { DataTable } from "../Table/table-data";
import { dashboardRecentAppointmentColumns } from "@/table-setting/columns";

interface DashboardRecentAppointmentProps {
  data: any[];
}

export function DashboardRecentAppointment({
  data,
}: DashboardRecentAppointmentProps) {
  const now = new Date();
  const mappedData = data?.slice().sort((a: any, b: any) => {
      const aTime = new Date(a.createdTime).getTime();
      const bTime = new Date(b.createdTime).getTime();
      return Math.abs(aTime - now.getTime()) - Math.abs(bTime - now.getTime());
    }).slice(0, 5).map((item: any) => ({
      id: item.$id,
      ...item,
    }));

  console.log(mappedData);

  return (
    <div className="flex flex-col p-6 border-sidebar-border rounded-lg border">
      <h1 className="font-bold mb-2 text-xl">Lịch Hẹn Gần Đây</h1>
      <p className="text-sm text-gray-500 mb-4">
        Danh sách các lịch hẹn sắp tới và gần đây
      </p>
      <DataTable
        columns={dashboardRecentAppointmentColumns}
        data={mappedData}
        filterType="none"
      />
    </div>
  );
}
