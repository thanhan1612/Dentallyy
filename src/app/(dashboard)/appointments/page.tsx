'use client'
import { appointmentService } from "@/api/appointment";
import { AppointmentCalendar } from "@/components/Appointment/appointment-calendar";
import { AppointmentList } from "@/components/Appointment/appointment-list";
import { PageContainer } from "@/components/PageContainer/page-container";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useCallback } from "react";
import { ModalType } from "@/types/modal";
import { patientsService } from "@/api/patients";
import { useModal } from "@/contexts/modal-context";
import { useAuth } from "@/contexts/AuthContext";
import { doctorService } from "@/api/doctors";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { useQuery } from '@tanstack/react-query';
import ProtectedLayout from "@/app/(protected)/layout";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { openModal } = useModal();

  const useFetchAppointmentDocuments = () => {
    return useQuery({
      queryKey: ['appointment-documents'],
      queryFn: async () => {
        const isBranchAdmin = user?.[0]?.role === 'branch_admin' || user?.labels?.includes('BADMIN');
        const isDoctor = user?.[0]?.role === 'doctor' || user?.labels?.includes('DOCTOR');

        if (isBranchAdmin || isDoctor) {
          return await appointmentService.fetchAppointmentDocuments({
            fieldId: 'branch',
            value: user?.[0]?.branch?.$id
          });
        } else {
          return await appointmentService.fetchAppointmentDocuments();
        }
      }
    });
  }

  const { data: appointmentDocuments, isLoading: isLoadingAppointmentDocuments, refetch: refetchAppointmentDocuments } = useFetchAppointmentDocuments();

  const handleAddAppointment = useCallback(() => {
    openModal(ModalType.APPOINTMENT, [
      {
        onSuccess: async (shouldRefetch: boolean) => {
          if (shouldRefetch) {
            await refetchAppointmentDocuments();
          }
        }
      }
    ]);
  }, [openModal, refetchAppointmentDocuments]);

  if (isLoadingAppointmentDocuments) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedLayout>
    <PageContainer
      title="Quản Lý Lịch Hẹn"
      actions={true}
      buttonName="Tạo Lịch Hẹn"
      modalType={ModalType.APPOINTMENT}
      onActionClick={handleAddAppointment}
    >
      <div className="flex border border-sidebar-border rounded-lg p-4 flex-col gap-4">
        <div className="text-2xl font-semibold">Lịch Hẹn</div>
        <div className="text-sm text-muted-foreground">Quản lý và theo dõi lịch hẹn của phòng khám</div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="bg-muted gap-2 px-2">
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm !flex-none"
            >
              Lịch
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm !flex-none"
            >
              Danh Sách
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calendar">
            <AppointmentCalendar data={appointmentDocuments?.data || []} />
          </TabsContent>
          <TabsContent value="list">
            <AppointmentList data={appointmentDocuments?.data || []} />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
    </ProtectedLayout>
  );
}
