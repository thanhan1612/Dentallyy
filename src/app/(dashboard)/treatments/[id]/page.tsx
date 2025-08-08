"use client"

import { Suspense, useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TreatmentHeader } from "@/components/Treatment/treatment-header"
import { TreatmentDetails } from "@/components/Treatment/treatment-details"
import { TreatmentNotes } from "@/components/Treatment/treatment-notes"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { treatmentService } from "@/api/treatment"
import { useQuery } from "@tanstack/react-query"
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen"
import { ModalView } from "@/components/Modal/modal-view"
import ProtectedLayout from "@/app/(protected)/layout"
import { RecordPrescriptions } from "@/components/Patients/record-prescription"

export default function TreatmentDetailPage() {
  const { id } = useParams()

  const useGetTreatmentById = () => {
    return useQuery({
      queryKey: ['treatment', id],
      queryFn: () => treatmentService.getTreatmentsByPatientId(id as string),
    })
  }

  const { data: treatment, isLoading: isLoadingTreatment } = useGetTreatmentById();

  const isLoading = isLoadingTreatment

  if(isLoading) {
    return <LoadingScreen />
  }

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/treatments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chi Tiết Điều Trị</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            In chi tiết
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <TreatmentHeader treatment={treatment} />

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Thông Tin Chi Tiết</TabsTrigger>
          <TabsTrigger value="notes">Ghi Chú</TabsTrigger>
          <TabsTrigger value="prescriptions" className="cursor-pointer">Đơn Thuốc</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <TreatmentDetails treatment={treatment} />
          </Suspense>
        </TabsContent>

        <TabsContent value="notes" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <TreatmentNotes treatment={treatment} />
          </Suspense>
        </TabsContent>

        <TabsContent value="prescriptions" className="pt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecordPrescriptions record={treatment} />
          </Suspense>
        </TabsContent>
      </Tabs>

        <ModalView />
      </div>
    </ProtectedLayout>
  )
}
