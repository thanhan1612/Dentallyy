import { TabsContent } from "@radix-ui/react-tabs";
import { PieChartComponent } from "../Charts/pie-chart";
import { CardReports } from "./card-reports";
import { LineChartComponent } from "../Charts/line-chart";
import { BarChartComponent } from "../Charts/bar-chart";

export function TreatmentReports() {
  const tabs = [
    { label: "Loại điều trị", value: "treatment-type" },
    { label: "Xu hướng", value: "trend" },
    { label: "Tỷ lệ thành công", value: "success-rate" },
  ];

  const data = [
    {
      name: "Trám răng",
      value: 250,
      fill: "#0088FE",
    },
    {
      name: "Nhổ răng",
      value: 120,
      fill: "#00C49F",
    },
    {
      name: "Tẩy trắng",
      value: 80,
      fill: "#FFBB28",
    },
    {
      name: "Niềng răng",
      value: 45,
      fill: "#FF8042",
    },
    {
      name: "Implant",
      value: 30,
      fill: "#8884d8",
    },
    {
      name: "Khác",
      value: 10,
      fill: "#82ca9d",
    },
  ];

  const lines = [
    {
      data: [
        { month: "T1", value: 8 },
        { month: "T2", value: 10 },
        { month: "T3", value: 12 },
        { month: "T4", value: 15 },
        { month: "T5", value: 18 },
        { month: "T6", value: 20 },
      ],
      name: "Nhổ rắng",
      color: "#FFBB28",
    },
    {
      data: [
        { month: "T1", value: 2 },
        { month: "T2", value: 9 },
        { month: "T3", value: 3 },
        { month: "T4", value: 10 },
        { month: "T5", value: 7 },
        { month: "T6", value: 11 },
      ],
      name: "Trám răng",
      color: "#8884d8",
    },
    {
      data: [
        { month: "T1", value: 8 },
        { month: "T2", value: 10 },
        { month: "T3", value: 12 },
        { month: "T4", value: 15 },
        { month: "T5", value: 18 },
        { month: "T6", value: 20 },
      ],
      name: "Tẩy trắng",
      color: "#FF8042",
    },
    {
      data: [
        { month: "T1", value: 12 },
        { month: "T2", value: 15 },
        { month: "T3", value: 18 },
        { month: "T4", value: 20 },
        { month: "T5", value: 22 },
        { month: "T6", value: 25 },
      ],
      name: "Niềng răng",
      color: "#0088FE",
    },
    {
      data: [
        { month: "T1", value: 10 },
        { month: "T2", value: 12 },
        { month: "T3", value: 15 },
        { month: "T4", value: 18 },
        { month: "T5", value: 20 },
        { month: "T6", value: 25 },
      ],
      name: "Implant",
      color: "#82ca9d",
    },
  ];

  const bars = [
    {
      data: [
        { label: "T1", value: 100 },
        { label: "T2", value: 200 },
        { label: "T3", value: 300 },
        { label: "T4", value: 400 },
        { label: "T5", value: 500 },
      ],
      name: "Tỷ lệ thành công",
      color: "#000000",
    },
  ];

  return (
    <CardReports
      title="Báo cáo điều trị"
      description="Phân tích các loại điều trị và xu hướng"
      tabs={tabs}
    >
      <TabsContent value="treatment-type">
        <PieChartComponent data={data} />
      </TabsContent>
      <TabsContent value="trend">
        <LineChartComponent lines={lines} />
      </TabsContent>
      <TabsContent value="success-rate">
        <BarChartComponent bars={bars} />
      </TabsContent>
    </CardReports>
  );
}
