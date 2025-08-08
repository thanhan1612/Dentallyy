import { StatCard } from "../StatCard/stat-card";
import { useAuth } from "@/contexts/AuthContext";
import { patientsService } from "@/api/patients";
import { useQuery } from "@tanstack/react-query";
import { Users, Clock4, CalendarCheck, UserPlus } from "lucide-react"
export function DashboardHeaderPatient({ data }: { data: any }) {
    const statCard = [
        {
            title: "Tổng Bệnh Nhân",
            description: `${data?.patients?.[1].percentage>=0 ? '+':'-'}${Math.abs(data?.patients?.[1].percentage)}% so với tháng trước`,
            value: data?.patients?.[0],
            icon: <Users />
        },
        {
            title: "Bệnh nhân mới",
            description: `${data?.newpatients?.percentage>=0 ? '+':'-'}${Math.abs(data?.newpatients?.percentage)}% so với tháng trước`,
            value: data?.newpatients?.numPatientsPast30days,
            icon: <UserPlus />
        },
        {
            title: "Đang điều trị",
            description: `${data?.intreatmentpatients.newTreatmentsNum} ca điều trị mới `,
            value:data?.intreatmentpatients?.inTreatmentsNum,
            icon: <Clock4 />
        },
        {
            title: "Hoàn thành điều trị",
            description: ` trong 30 ngày qua `,
            value: data?.donepatients?.numTreatmentPast30days,
            icon: <CalendarCheck />
        }
    ]
  return (
    <>
        {statCard.map((item, index) => (
            <StatCard key={index} title={item.title} description={item.description} value={item.value} icon={item.icon} />
        ))}
    </>
  )
};