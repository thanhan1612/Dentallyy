import { StatCard } from "../StatCard/stat-card"
import { Calendar, DollarSign, Box, Users } from "lucide-react"
export function DashboardHeader({ data }: { data: any }) {
    const statCard = [
        {
            title: "Tổng Bệnh Nhân",
            description: `${data?.patients?.percentage}% tăng so với tháng trước`,
            value: data?.patients?.currentMonth,
            icon: <Users />
        },
        {
            title: "Lịch Hẹn Hôm Nay",
            description: `${data?.appointments?.length} lịch hẹn`,
            value: data?.appointments?.length,
            icon: <Calendar />
        },
        {
            title: "Doanh Thu Tháng",
            description: `${data?.totalRevenue?.percentage}% tăng so với tháng trước`,
            value: data?.totalRevenue?.currentMonth,
            icon: <DollarSign />
        },
        {
            title: "Vật Tư Cần Bổ Sung",
            description: `${data?.inventory?.expired} vật tư sắp hết hạn`,
            value: data?.inventory?.lowStock,
            icon: <Box />
        }
    ]
  return (
    <>
        {statCard.map((item, index) => (
            <StatCard key={index} title={item.title} description={item.description} value={item.value} icon={item.icon} />
        ))}
    </>
  )
}
