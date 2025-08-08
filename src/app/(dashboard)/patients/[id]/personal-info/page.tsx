'use client'

import { Suspense } from "react"
import { notFound, useParams } from "next/navigation"
import { PatientProfile } from "@/components/Patients/Info/patient-profile"
import { PatientTreatmentPlans } from "@/components/Patients/Info/patient-treatment-plans"
import { PatientAppointments } from "@/components/Patients/Info/patient-appointment"
import { PatientMedicalRecords } from "@/components/Patients/Info/patient-medical-records"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { patientsService } from "@/api/patients"
import ageCalculate from "@/utils/age-calculate"
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen"
import ProtectedLayout from "@/app/(protected)/layout"

export default  function PatientPage() {
  const { id } = useParams()

 const useGetPatientDocumentById = (patientId: string) => {
  return useQuery({
    queryKey: ["patients-personal-info", patientId],
    queryFn: () => patientsService.getPatientById(patientId),
  })
 }

  const { data: patient, isLoading: isLoadingPatient } = useGetPatientDocumentById(id as string);

  if (isLoadingPatient) {
    return <LoadingScreen/>
  }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{patient?.name}</h1>
        <p className="text-muted-foreground">
          Mã bệnh nhân: {patient?.patient_code} | {patient?.gender}, {ageCalculate(patient?.dob)} tuổi
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Hồ Sơ</TabsTrigger>
          <TabsTrigger value="medical">Bệnh Án</TabsTrigger>
          <TabsTrigger value="treatments">Kế Hoạch Điều Trị</TabsTrigger>
          <TabsTrigger value="appointments">Lịch Hẹn</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PatientProfile patient={patient} />
          </Suspense>
        </TabsContent>

        <TabsContent value="medical" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PatientMedicalRecords patient={patient} />
          </Suspense>
        </TabsContent>

        <TabsContent value="treatments" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PatientTreatmentPlans patient={patient} />
          </Suspense>
        </TabsContent>

        <TabsContent value="appointments" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <PatientAppointments patient={patient} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedLayout>
  )
}
