"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, FileText, Plus, Edit, Save } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { treatmentService } from "@/api/treatment"
import { formatDateToDisplay } from "@/utils/date-utils"
import { patientsService } from "@/api/patients"
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen"

interface PatientMedicalRecordsProps {
  patient: any
}

export function PatientMedicalRecords({ patient }: PatientMedicalRecordsProps) {
  const [editingMedicalHistory, setEditingMedicalHistory] = useState(false)
  const [editingAllergies, setEditingAllergies] = useState(false)

  const [medicalHistory, setMedicalHistory] = useState("")
  const [allergies, setAllergies] = useState("")
  const queryClient = useQueryClient()

  useEffect(() => {
    setMedicalHistory(patient?.medical_history || "")
    setAllergies(patient?.allergies || "")
  }, [patient])

  const handleSaveMedicalHistory = async() => {
    await patientsService.updatePatientDocument(patient?.$id, {
      medical_history: medicalHistory
    })
    await queryClient.refetchQueries({ queryKey: ['patients-personal-info', patient?.$id] })
    setEditingMedicalHistory(false)
  }

  const handleSaveAllergies = async() => {
    await patientsService.updatePatientDocument(patient?.$id, {
      allergies: allergies
    })
    await queryClient.refetchQueries({ queryKey: ['patients-personal-info', patient?.$id] })
    setEditingAllergies(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="gap-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Tiền Sử Bệnh</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => editingMedicalHistory ? handleSaveMedicalHistory() : setEditingMedicalHistory(true)}>
              {editingMedicalHistory ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {editingMedicalHistory ? (
              <Textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Nhập tiền sử bệnh của bệnh nhân"
                className="min-h-[150px]"
              />
            ) : (
              <p className={medicalHistory ? "" : "text-muted-foreground"}>
                {medicalHistory || "Không có thông tin về tiền sử bệnh"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Dị Ứng</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => editingAllergies ? handleSaveAllergies() : setEditingAllergies(true)}>
              {editingAllergies ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {editingAllergies ? (
              <Textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Nhập thông tin dị ứng của bệnh nhân"
                className="min-h-[150px]"
              />
            ) : (
              <p className={allergies ? "" : "text-muted-foreground"}>{allergies || "Không có thông tin về dị ứng"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hồ Sơ Bệnh Án</CardTitle>
          <CardDescription>Lịch sử bệnh án và các ghi chú y tế</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="records">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="records">Bệnh Án</TabsTrigger>
              <TabsTrigger value="notes">Ghi Chú</TabsTrigger>
              <TabsTrigger value="images">Hình Ảnh</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4 pt-4">
              {patient?.treatment && patient?.treatment?.length > 0 ? (
                patient?.treatment?.map((treatment: any) => (
                  <Card key={treatment?.$id} className="gap-2">
                    <CardHeader className="">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{treatment?.treatment_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{formatDateToDisplay(treatment?.start_date)}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Ghi chú điều trị sẽ hiển thị ở đây. Hiện tại chưa có thông tin chi tiết.
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Chưa có bệnh án</h3>
                  <p className="text-sm text-muted-foreground mt-2">Bệnh nhân này chưa có bệnh án nào được ghi nhận</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ghi Chú Y Tế</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea placeholder="Thêm ghi chú y tế cho bệnh nhân này..." className="min-h-[200px]" />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu ghi chú
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="pt-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Chưa có hình ảnh</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Bệnh nhân này chưa có hình ảnh y tế nào được tải lên
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Tải lên hình ảnh
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
