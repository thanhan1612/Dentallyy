"use client"

import { Suspense } from "react"
import { useRouter, useParams } from "next/navigation"
import { TabsContent } from "@/components/ui/tabs"
import { Printer, Download, ArrowLeft } from "lucide-react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs } from "@/components/ui/tabs"
import { RecordDetails } from "@/components/Patients/record-details"
import { RecordPrescriptions } from "@/components/Patients/record-prescription"
import { RecordNotes } from "@/components/Patients/record-notes"
import { RecordTreatments } from "@/components/Patients/record-treatment"
import { RecordHeader } from "@/components/Patients/record-header"
import { patientsService } from "@/api/patients"
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen"
import { appointmentService } from "@/api/appointment"
import { doctorService } from "@/api/doctors"
import { useQuery } from "@tanstack/react-query"
import ProtectedLayout from "@/app/(protected)/layout"

export default function PatientDetailPage() {
  const router = useRouter()
  const { id } = useParams()

  const usePatientDocumentsById = (patientId: string) => {
    return useQuery({
      queryKey: ['patient-info', patientId],
      queryFn: () => patientsService.getPatientById(patientId),
      enabled: !!patientId
    })
  }

  const { data: patientRes, isLoading: isLoadingPatient } = usePatientDocumentsById(id as any);

  if (isLoadingPatient) return <LoadingScreen />

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild onClick={() => router.push("/patients")} className="border-none cursor-pointer">
              <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Hồ Sơ Bệnh Án #{patientRes?.patient_code}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            In hồ sơ
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <RecordHeader record={patientRes} />
      </Suspense>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="cursor-pointer">Thông Tin Chung</TabsTrigger>
          <TabsTrigger value="treatments" className="cursor-pointer">Điều Trị</TabsTrigger>
          {/* <TabsTrigger value="images" className="cursor-pointer">Hình Ảnh</TabsTrigger> */}
          <TabsTrigger value="notes" className="cursor-pointer">Ghi Chú</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecordDetails record={patientRes} />
          </Suspense>
        </TabsContent>

        <TabsContent value="treatments" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecordTreatments record={patientRes} />
          </Suspense>
        </TabsContent>

        <TabsContent value="notes" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecordNotes record={patientRes} />
          </Suspense>
        </TabsContent>

        {/* <TabsContent value="prescriptions" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecordPrescriptions record={patientRes?.data[0]} />
          </Suspense>
        </TabsContent> */}
      </Tabs>
    </div>
    </ProtectedLayout>
  )
}

