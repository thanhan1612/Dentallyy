'use client'
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialReports } from "./financial-reports"
import { PatientReports } from "./patient-reports"
import { useRouter, useSearchParams } from "next/navigation"
import { TreatmentReports } from "./treatment-reports"
import { AppointmentReports } from "./appointment-reports"
import { InventoryReports } from "./inventory-reports"

function ReportsNavContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'financial';
  
  const handleTabChange = (value: string) => {
    router.push(`/reports?tab=${value}`);
  };

  const tabs = [
    { label: "Tài chính", value: "financial" },
    { label: "Bệnh nhân", value: "patients" },
    { label: "Điều trị", value: "treatments" },
    { label: "Lịch hẹn", value: "appointments" },
    { label: "Vật tư", value: "inventory" },
  ];

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="financial">
        <FinancialReports />
      </TabsContent>
      <TabsContent value="patients">
        <PatientReports />
      </TabsContent>
      <TabsContent value="treatments">
        <TreatmentReports />
      </TabsContent>
      <TabsContent value="appointments">
        <AppointmentReports />
      </TabsContent>
      <TabsContent value="inventory">
        <InventoryReports />
      </TabsContent>
    </Tabs>
  );
}

export function ReportsNav() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsNavContent />
    </Suspense>
  );
}
