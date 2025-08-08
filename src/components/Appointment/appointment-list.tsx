import { DataTable } from "../Table/table-data";
import { getAppointmentColumns } from "@/table-setting/columns";
import { formatDateToDisplay } from "@/utils/date-utils";
import { useAuth } from "@/contexts/AuthContext";

export function AppointmentList({ data }: any) {
  const { user } = useAuth();

  return (
    <div className="mt-4">
      <DataTable columns={getAppointmentColumns()} data={data} />
    </div>
  );
}
