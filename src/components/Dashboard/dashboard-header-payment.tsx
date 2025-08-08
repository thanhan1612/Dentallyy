import { StatCard } from "../StatCard/stat-card";
import { Clock4, CreditCard, RefreshCcw, DollarSign } from "lucide-react"
export function DashboardHeaderPayment({ data }: { data: any }) {
    const statCard = [
        {
            title: "Tổng thu",
            description: `${data?.totalRevenue?.percentage}% so với tháng trước`,
            value: data?.totalRevenue?.currentMonth,
            icon: <DollarSign />
        },
        {
            title: "Giao dịch ",
            description: `${data?.numTransactions?.percentage}% so với tháng trước `,
            value: data?.numTransactions?.num,
            icon: <CreditCard />
        },
        {
            title: "Chờ thanh toán",
            description: `${data?.processTransactions?.num} giao dịch đang chờ `,
            value: data?.processTransactions?.cost,
            icon: <Clock4 />
        },
       
    ]
  return (
    <>
        {statCard.map((item, index) => (
            <StatCard key={index} title={item.title} description={item.description} value={item.value} icon={item.icon} />
        ))}
    </>
  )