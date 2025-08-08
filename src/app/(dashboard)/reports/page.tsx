"use client";

import { Suspense } from "react";
import { PageContainer } from "@/components/PageContainer/page-container";
import { ReportsNav } from "@/components/Reports/reports-nav";
import ProtectedLayout from "@/app/(protected)/layout";

export default function ReportsPage() {
  return (
    <ProtectedLayout>
    <PageContainer title="Báo Cáo" actions={false} subTitle="Xem và phân tích dữ liệu hoạt động của phòng khám">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col gap-10">
          <ReportsNav />
        </div>
      </Suspense>
    </PageContainer>
    </ProtectedLayout>
  );
}
