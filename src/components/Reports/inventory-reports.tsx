import { TabsContent } from "../ui/tabs";
import { CardReports } from "./card-reports";
import { BarChartComponent } from "../Charts/bar-chart";

export function InventoryReports() {
  const tabs = [
    { label: "Sử dụng", value: "used" },
    { label: "Giá trị", value: "value" },
    { label: "Sắp hết hạn", value: "expired" },
  ];

  const usedBars = [
    {
      data: [
        { label: "T1", value: 100 },
        { label: "T2", value: 200 },
        { label: "T3", value: 300 },
        { label: "T4", value: 400 },
        { label: "T5", value: 500 },
      ],
      name: "Sử dụng",
      color: "hsl(var(--primary))",
    },
    {
      data: [
        { label: "T1", value: 200 },
        { label: "T2", value: 300 },
        { label: "T3", value: 400 },
        { label: "T4", value: 500 },
        { label: "T5", value: 100 },
      ],
      name: "Nhập kho",
      color: "hsl(var(--secondary))",
    },
  ];

  const expiredBars = [
    {
      data: [
        { label: "Vật tư A", value: 100 },
        { label: "Vật tư B", value: 200 },
        { label: "Vật tư C", value: 300 },
        { label: "Vật tư D", value: 400 },
        { label: "Vật tư E", value: 500 },
      ],
      name: "Sắp hết hạn",
      color: "hsl(var(--primary))",
    },
  ];
  return (
    <CardReports
      title="Báo cáo bệnh nhân"
      description="Phân tích số lượng bệnh nhân và phân bố bệnh nhân"
      tabs={tabs}
    >
      <TabsContent value="used">
        <BarChartComponent bars={usedBars} />
      </TabsContent>
      <TabsContent value="value">
        <BarChartComponent bars={usedBars} />
      </TabsContent>
      <TabsContent value="expired">
        <BarChartComponent bars={expiredBars} />
      </TabsContent>
    </CardReports>
  );
}
