"use client";

import { useParams } from "next/navigation";

export default function AppointmentDetailPage() {
  const params = useParams();
  const appointmentId = params.id;

  return (
    <div>
      <h1>Chi tiết lịch hẹn {appointmentId}</h1>
      {/* Thêm nội dung chi tiết lịch hẹn ở đây */}
    </div>
  );
}
