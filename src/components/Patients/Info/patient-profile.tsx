"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Phone, Calendar, Edit, User } from "lucide-react";
import ageCalculate from "@/utils/age-calculate";
import { formatDateToDisplay } from "@/utils/date-utils";

interface PatientProfileProps {
  patient: any;
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getAppointmentInfo = () => {
    if (!patient?.appointments?.length) {
      return {
        firstVisit: null,
        lastVisit: null,
        nextAppointment: null,
      };
    }

    const now = new Date();

    const confirmedPastAppointments = patient?.appointments?.filter(
      (appointment: any) =>
        new Date(appointment?.appointment_date) < now &&
        appointment?.status === "confirm"
    );

    const futureAppointments = patient?.appointments?.filter(
      (appointment: any) =>
        new Date(appointment?.appointment_date) >= now &&
        appointment?.status === "confirm"
    );

    const sortedPastAppointments = confirmedPastAppointments?.sort(
      (a: any, b: any) => {
        const dateA = new Date(a?.appointment_date);
        const dateB = new Date(b?.appointment_date);
        return dateA.getTime() - dateB.getTime();
      }
    );

    const sortedFutureAppointments = futureAppointments?.sort(
      (a: any, b: any) => {
        const dateA = new Date(a?.appointment_date);
        const dateB = new Date(b?.appointment_date);
        return dateA.getTime() - dateB.getTime();
      }
    );

    return {
      firstVisit: sortedPastAppointments[0],
      lastVisit: sortedPastAppointments[sortedPastAppointments.length - 1],
      nextAppointment: sortedFutureAppointments[0],
    };
  };

  const getTreatmentInfo = () => {
    if (!patient?.treatment?.length) {
      return {
        status: "Mới",
      };
    }

    const inProgressTreatments = patient?.treatment?.filter(
      (treatment: any) => treatment?.status === "progress"
    );

    const scheduledTreatments = patient?.treatment?.filter(
      (treatment: any) => treatment?.status === "schedule"
    );

    const completedTreatments = patient?.treatment?.filter(
      (treatment: any) => treatment?.status === "completed"
    );

    let status = "Mới";
    if (inProgressTreatments?.length > 0) {
      status = "Đang điều trị";
    } else if (scheduledTreatments?.length > 0) {
      status = "Mới";
    } else if (completedTreatments?.length > 0) {
      status = "Hoàn thành";
    }

    return {
      status,
    };
  };

  const totalAppointments =
    patient?.appointments?.filter(
      (appointment: any) => appointment?.status === "confirm"
    ).length ||
    patient?.treatment?.length ||
    0;

  const appointmentInfo = getAppointmentInfo();
  const treatmentInfo = getTreatmentInfo();

  const sortedTreatments = patient?.treatment?.sort((a: any, b: any) => {
    const dateA = new Date(a?.start_date);
    const dateB = new Date(b?.start_date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={patient?.image} alt={patient?.name} />
            <AvatarFallback className="text-2xl">
              {patient?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-2xl font-bold">{patient?.name}</h2>
            <p className="text-muted-foreground">
              Mã bệnh nhân: {patient?.patient_code}
            </p>
            <div className="mt-2">
              <Badge
                variant={
                  treatmentInfo?.status === "progress"
                    ? "default"
                    : treatmentInfo?.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {treatmentInfo?.status}
              </Badge>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông Tin Cá Nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{patient?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giới tính</p>
                <p className="font-medium">{patient?.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tuổi</p>
                <p className="font-medium">{ageCalculate(patient?.dob)} tuổi</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-medium">
                  {patient?.dob ? formatDateToDisplay(patient?.dob) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Thông Tin Liên Hệ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-medium">{patient?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{patient?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
              <p className="font-medium">{patient?.address || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch Sử Khám
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ngày khám đầu tiên
                </p>
                <p className="font-medium">
                  {!patient?.appointments?.length &&
                  patient?.treatment?.length > 0
                    ? formatDateToDisplay(sortedTreatments[0]?.start_date)
                    : appointmentInfo?.firstVisit
                    ? formatDateToDisplay(
                        appointmentInfo?.firstVisit?.appointment_date
                      )
                    : "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Lần khám gần nhất
                </p>
                <p className="font-medium">
                  {!patient?.appointments?.length &&
                  patient?.treatment?.length > 0
                    ? formatDateToDisplay(
                        sortedTreatments[sortedTreatments.length - 1]
                          ?.start_date
                      )
                    : appointmentInfo?.lastVisit
                    ? formatDateToDisplay(
                        appointmentInfo?.lastVisit?.appointment_date
                      )
                    : "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Lịch hẹn tiếp theo
                </p>
                <p className="font-medium">
                  {appointmentInfo?.nextAppointment
                    ? formatDateToDisplay(
                        appointmentInfo?.nextAppointment?.appointment_date
                      )
                    : "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng số lần khám
                </p>
                <p className="font-medium">{totalAppointments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
