import { BarChartComponent } from "@/components/Charts/bar-chart";
import { LineChartComponent } from "@/components/Charts/line-chart";

interface DashboardChartProps {
  patients: any[];
  payments: any[];
}

export function DashboardChart({ patients, payments }: DashboardChartProps) {
  // get day in month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthLabel = (currentMonth + 1).toString();

  // day marks: 1, 5, 10, 15, 20, 25, 30 or last day of month if no day 30
  const dayMarks = [1, 5, 10, 15, 20, 25];
  if (daysInMonth >= 30) {
    dayMarks.push(30);
  } else {
    dayMarks.push(daysInMonth);
  }

  // create ranges: 1-5, 6-10, 11-15, ... and label like 'start/month'
  const ranges = [];
  for (let i = 0; i < dayMarks.length; i++) {
    const start = i === 0 ? 1 : dayMarks[i - 1] + 1;
    const end = dayMarks[i];
    const label = `${start}/${monthLabel}`;
    ranges.push({ start, end, label });
  }

  // Bar chart: total patients in each range
  const patientsPerRange = ranges.map((range) => {
    const count = patients?.filter((item: any) => {
      const date = new Date(item?.createdDate);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        date.getDate() >= range.start &&
        date.getDate() <= range.end
      );
    }).length;
    return { label: range.label, value: count };
  });

  // Line chart: total revenue in each range
  const revenuePerRange = ranges.map((range) => {
    const paymentsInRange = payments?.filter((item: any) => {
      const date = new Date(item?.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        date.getDate() >= range.start &&
        date.getDate() <= range.end
      );
    }) || [];
    const total = paymentsInRange.reduce((acc: number, item: any) => {
      const paidArray = item?.paid || [];
      const paidAmount = paidArray.reduce((sum: number, payment: any) => {
        let paymentObj = payment;
        if (typeof payment === "string") {
          try {
            paymentObj = JSON.parse(payment);
          } catch {
            paymentObj = {};
          }
        }
        return sum + Number(paymentObj?.paid_amount || 0);
      }, 0);
      return acc + paidAmount;
    }, 0);
    return { month: range.label, value: total };
  });

  return (
    <div className="flex gap-8 rounded-lg">
      <div className="w-1/2 border-sidebar-border rounded-lg p-6 border">
        <h1 className="font-bold mb-2 text-xl">Số Lượng Bệnh Nhân</h1>
        <p className="text-sm text-gray-500 mb-4">Thống kê số lượng bệnh nhân trong 30 ngày qua</p>
        <BarChartComponent
          bars={[
            {
              data: patientsPerRange,
              name: "Bệnh nhân",
              color: "hsl(var(--primary))",
            },
          ]}
          format="number"
          legend={false}
        />
      </div>
      <div className="w-1/2 border-sidebar-border rounded-lg p-6 border">
        <h1 className="font-bold mb-2 text-xl">Doanh Thu</h1>
        <p className="text-sm text-gray-500 mb-4">Thống kê doanh thu trong 30 ngày qua</p>
        <LineChartComponent
          lines={[
            {
              data: revenuePerRange,
              name: "Doanh thu",
              color: "#000000",
            },
          ]}
          format="number"
          legend={false}
        />
      </div>
    </div>
  );
}
