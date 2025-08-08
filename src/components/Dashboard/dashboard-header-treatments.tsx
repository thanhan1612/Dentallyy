import { StatCard } from "../StatCard/stat-card";
import { useAuth } from "@/contexts/AuthContext";
import { patientsService } from "@/api/patients";
import { useQuery } from "@tanstack/react-query";
import { Clock4, Calendar, CircleCheckBig, DollarSign } from "lucide-react"
export function DashboardHeaderTreatment({ data }: { data: any }) {
    const statCard = [
        {
            title: "Tổng điều trị",
            description: `${data?.totalTreatments?.[0] >=0 ? '+':'-'}${Math.abs(data?.totalTreatments?.[0])}% so với tháng trước`,
            value: data?.totalTreatments?.[1],
            icon: <Calendar />
        },
        {
            title: "Đang thực hiện",
            description: `${data?.processTreatments?.[1]} điều trị mới trong tháng`,
            value: data?.processTreatments?.[0],
            icon: <Clock4 />
        },
        {
            title: "Hoàn thành",
            description: `${data?.doneTreatments?.[1] ? '+':'-'}${Math.abs(data?.doneTreatments?.[1])}% so với tháng trước `,
            value:data?.doneTreatments?.[0],
            icon: <CircleCheckBig />
        },
        {
            title: "Doanh thu",
            description: `${data?.revenue?.[1] ? '+':'-'}${Math.abs(data?.revenue?.[1])}% so với tháng trước`,
            value: data?.revenue?.[0],
            icon: <DollarSign />
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