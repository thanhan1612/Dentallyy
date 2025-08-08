"use client";

import { TabsContent } from "@/components/ui/tabs";

import { CardReports } from "./card-reports";
import { LineChartComponent } from "../Charts/line-chart";

const revenueData = [
  {
    data: [
      { month: "T1", value: 45000000 },
      { month: "T2", value: 52000000 },
      { month: "T3", value: 48000000 },
      { month: "T4", value: 61000000 },
      { month: "T5", value: 55000000 },
      { month: "T6", value: 67000000 },
      { month: "T7", value: 72000000 },
      { month: "T8", value: 69000000 },
      { month: "T9", value: 78000000 },
      { month: "T10", value: 82000000 },
      { month: "T11", value: 76000000 },
      { month: "T12", value: 85000000 },
    ],
    name: "Doanh thu",
    color: "hsl(var(--primary))",
  },
];

const costData = [
  {
    data: [
      { month: "T1", value: 25000000 },
      { month: "T2", value: 28000000 },
      { month: "T3", value: 26000000 },
      { month: "T4", value: 31000000 },
      { month: "T5", value: 29000000 },
      { month: "T6", value: 32000000 },
      { month: "T7", value: 35000000 },
      { month: "T8", value: 34000000 },
      { month: "T9", value: 38000000 },
      { month: "T10", value: 40000000 },
      { month: "T11", value: 37000000 },
      { month: "T12", value: 42000000 },
    ],
    name: "Chi phí",
    color: "hsl(var(--destructive))",
  },
];

const profitData = [
  {
    data: [
      { month: "T1", value: 20000000 },
      { month: "T2", value: 24000000 },
      { month: "T3", value: 22000000 },
      { month: "T4", value: 30000000 },
      { month: "T5", value: 26000000 },
      { month: "T6", value: 35000000 },
      { month: "T7", value: 37000000 },
      { month: "T8", value: 35000000 },
      { month: "T9", value: 40000000 },
      { month: "T10", value: 42000000 },
      { month: "T11", value: 39000000 },
      { month: "T12", value: 43000000 },
    ],
    name: "Lợi nhuận",
    color: "hsl(var(--primary))",
  },
];

const tabs = [
  { label: "Doanh thu", value: "revenue" },
  { label: "Chi phí", value: "cost" },
  { label: "Lợi nhuận", value: "profit" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export function FinancialReports() {
  return (
    <CardReports
      title="Báo cáo tài chính"
      description="Phân tích doanh thu, chi phí và lợi nhuận của phòng khám"
      tabs={tabs}
    >
      <TabsContent value="revenue">
        <LineChartComponent lines={revenueData} format="number" />
      </TabsContent>
      <TabsContent value="cost">
        <LineChartComponent lines={costData} format="number" />
      </TabsContent>
      <TabsContent value="profit">
        <LineChartComponent lines={profitData} format="number" />
      </TabsContent>
    </CardReports>
  );
}
