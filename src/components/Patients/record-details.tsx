"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Edit, Save } from "lucide-react"
import { formatDateToDisplay } from "@/utils/date-utils"
import { patientsService } from "@/api/patients"
import { useQueryClient } from "@tanstack/react-query"

interface RecordDetailsProps {
  record: any
}

export function RecordDetails({ record }: RecordDetailsProps) {
  const [editingMedicalHistory, setEditingMedicalHistory] = useState(false)
  const [editingAllergies, setEditingAllergies] = useState(false)
  const [editingDentalHistory, setEditingDentalHistory] = useState(false)
  const [recordCode, setRecordCode] = useState("")

  const [medicalHistory, setMedicalHistory] = useState("")
  const [allergies, setAllergies] = useState("")
  const [dentalHistory, setDentalHistory] = useState("")

  const queryClient = useQueryClient()

  useEffect(() => {
    if (record) {
      setMedicalHistory(record?.medical_history || "")
      setAllergies(record?.allergies || "")
      setDentalHistory(record?.dental_history || "")
      setRecordCode(record?.patient_code.replace(/^P/, 'R') || "")
    }
  }, [record])

  const handleSaveMedicalHistory = async() => {
    await patientsService.updatePatientDocument(record?.$id, {
      medical_history: medicalHistory
    })
    await queryClient.invalidateQueries({ queryKey: ['patients'] })
    setEditingMedicalHistory(false)
  }

  const handleSaveAllergies = async() => {
    await patientsService.updatePatientDocument(record?.$id, {
      allergies: allergies
    })
    await queryClient.invalidateQueries({ queryKey: ['patients'] })
    setEditingAllergies(false)
  }

  const handleSaveDentalHistory = async() => {
    await patientsService.updatePatientDocument(record?.$id, {
      dental_history: dentalHistory
    })
    await queryClient.invalidateQueries({ queryKey: ['patients'] })
    setEditingDentalHistory(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Tiền Sử Bệnh</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => editingMedicalHistory ? handleSaveMedicalHistory() : setEditingMedicalHistory(true)}
            >
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Dị Ứng</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => editingAllergies ? handleSaveAllergies() : setEditingAllergies(true)}
            >
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Tiền Sử Nha Khoa</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => editingDentalHistory ? handleSaveDentalHistory() : setEditingDentalHistory(true)}
          >
            {editingDentalHistory ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent>
          {editingDentalHistory ? (
            <Textarea
              value={dentalHistory}
              onChange={(e) => setDentalHistory(e.target.value)}
              placeholder="Nhập tiền sử nha khoa của bệnh nhân"
              className="min-h-[150px]"
            />
          ) : (
            <p className={dentalHistory ? "" : "text-muted-foreground"}>
              {dentalHistory || "Không có thông tin về tiền sử nha khoa"}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Hồ Sơ</CardTitle>
          <CardDescription>Chi tiết về hồ sơ bệnh án</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Mã hồ sơ</p>
              <p className="font-medium">{recordCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bác sĩ phụ trách</p>
              <p className="font-medium">{record?.staffManagement?.[0]?.name ? `BS. ${record?.staffManagement?.[0]?.name}` : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày tạo</p>
              <p className="font-medium">{formatDateToDisplay(record?.$createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
              <p className="font-medium">{record?.$updatedAt ? formatDateToDisplay(record?.$updatedAt) : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
