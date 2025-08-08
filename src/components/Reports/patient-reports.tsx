import { TabsContent } from "../ui/tabs";
import { CardReports } from "./card-reports";
import { BarChartComponent } from "../Charts/bar-chart";

export function PatientReports() {
  const tabs = [
    { label: "Tăng trưởng", value: "patient-growth" },
    { label: "Độ tuổi", value: "patient-age" },
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
      name: "Bệnh nhân mới",
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
      name: "Bệnh nhân quay lại",
      color: "hsl(var(--secondary))",
    },
  ];
  return (
    <CardReports
      title="Báo cáo bệnh nhân"
      description="Phân tích số lượng bệnh nhân và phân bố bệnh nhân"
      tabs={tabs}
    >
      <TabsContent value="patient-growth">
        <BarChartComponent bars={bars} />
      </TabsContent>
      <TabsContent value="patient-age">
        <BarChartComponent bars={bars} />
      </TabsContent>
    </CardReports>
  );
}
