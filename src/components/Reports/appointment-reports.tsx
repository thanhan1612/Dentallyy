import { TabsContent } from "@radix-ui/react-tabs";
import { PieChartComponent } from "../Charts/pie-chart";
import { CardReports } from "./card-reports";
import { BarChartComponent } from "../Charts/bar-chart";
  
export function AppointmentReports() {
  const tabs = [
    { label: "Trạng thái", value: "status" },
    { label: "Theo ngày", value: "by-day" },
    { label: "Theo giờ", value: "by-hour" },
  ];

  const data = [
    {
      name: "Hoàn thành",
      value: 65,
      fill: "#0088FE",
    },
    {
      name: "Hủy bỏ",
      value: 10,
      fill: "#FFBB28",
    },
    {
      name: "Đã đặt lịch",
      value: 25,
      fill: "#FF8042",
    },
  ];

  const barsByDay = [
    {
      data: [
        { label: "Thứ 2", value: 10 },
        { label: "Thứ 3", value: 20 },
        { label: "Thứ 4", value: 30 },
        { label: "Thứ 5", value: 40 },
        { label: "Thứ 6", value: 50 },
        { label: "Thứ 7", value: 60 },
        { label: "Chủ nhật", value: 70 },
      ],
      name: "Số lịch hẹn",
      color: "hsl(var(--primary))",
    },
  ];

  const barsByHour = [
    {
      data: [
        { label: "08:00", value: 10 },
        { label: "09:00", value: 20 },
        { label: "10:00", value: 30 },
        { label: "11:00", value: 40 },
        { label: "12:00", value: 50 },
        { label: "13:00", value: 60 },
        { label: "14:00", value: 70 },
        { label: "15:00", value: 80 },
        { label: "16:00", value: 90 },
      ],
      name: "Số lịch hẹn",
      color: "hsl(var(--primary))",
    },
  ];
  return (
    <CardReports
      title="Báo cáo lịch hẹn"
      description="Phân tích lịch hẹn và tỷ lệ hoàn thành"
      tabs={tabs}
    >
      <TabsContent value="status">
        <PieChartComponent data={data} />
      </TabsContent>
      <TabsContent value="by-day">
        <BarChartComponent bars={barsByDay} format="time" />
      </TabsContent>
      <TabsContent value="by-hour">
        <BarChartComponent bars={barsByHour} format="time" />
      </TabsContent>
    </CardReports>
  );
}
