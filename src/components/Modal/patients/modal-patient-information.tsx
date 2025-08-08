import { CardContent, CardDescription } from "@/components/ui/card";
import {
  Calendar,
  ClipboardList,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts/modal-context";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { formatDateToDisplay } from "@/utils/date-utils";
import ageCalculate from "@/utils/age-calculate";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function ModalPatientInformation() {
  const { modalData } = useModal();
  const router = useRouter();
  const { closeModal } = useModal();

  const handleViewFullProfile = () => {
    closeModal();
    router.push(`/patients/${modalData?.$id}`);
  };

  const handleScheduleAppointment = () => {
    closeModal();
    router.push(`/appointments`);
  };

  const handleViewAppointmentHistory = () => {
    closeModal();
    router.push(`/appointments`);
  };

  const sortedTreatments = modalData?.treatment?.sort((a: any, b: any) => {
    return new Date(b?.start_date).getTime() - new Date(a?.start_date).getTime();
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col">
        <DialogTitle className="text-2xl font-bold">Thông tin bệnh nhân</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Chi tiết thông tin và lịch sử khám chữa bệnh
        </DialogDescription>
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={modalData?.image} alt={modalData?.name} />
            <AvatarFallback className="text-2xl">
              {modalData?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">{modalData.name}</h3>
            <p className="text-sm text-muted-foreground">
              Mã BN: {modalData?.patient_code}
            </p>
            <div className="mt-2">
              <Badge
                variant={
                  sortedTreatments?.length === 0 || sortedTreatments[0]?.status === "progress"
                    ? "default"
                    : sortedTreatments[0]?.status === "schedule"
                      ? "outline"
                      : sortedTreatments[0]?.status === "completed"
                        ? "secondary"
                        : "destructive"
                }
              >
                {sortedTreatments?.length > 0 ? (
                  sortedTreatments[0]?.status === "progress"
                    ? "Đang Điều Trị"
                  : sortedTreatments && sortedTreatments[0]?.status === "schedule"
                    ? "Đã lên lịch"
                    : sortedTreatments[0]?.status === "completed"
                      ? "Hoàn thành"
                      : "Hủy"
                ) : (
                  "Mới"
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông Tin</TabsTrigger>
              <TabsTrigger value="medical">Hồ Sơ Y Tế</TabsTrigger>
              <TabsTrigger value="treatments">Điều Trị</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{modalData?.phone || "N/A"}</span>
                </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate" title={modalData?.email}>
                      {modalData?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {modalData?.dob ? ageCalculate(modalData?.dob) : "N/A"} tuổi ({modalData?.gender || "N/A"})
                    </span>
                  </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{modalData?.address || "N/A"}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Lịch sử khám</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lần khám gần nhất</p>
                    {!modalData?.lastVisit && sortedTreatments[0]?.start_date ? (
                      <div className="space-y-1">
                        <p className="font-medium">{formatDateToDisplay(sortedTreatments[0]?.start_date)}</p>
                      </div>
                    ) : modalData?.lastVisit ? (
                      <p className="font-medium">{formatDateToDisplay(modalData?.lastVisit?.appointment_date)}</p>
                    ) : (
                      <p className="font-medium">Chưa có lịch sử khám</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lịch hẹn tiếp theo</p>
                    {modalData?.nextAppointment ? (
                      <div className="space-y-1">
                        <p className="font-medium">{formatDateToDisplay(modalData?.nextAppointment?.appointment_date)}</p>
                      </div>
                    ) : (
                      <p className="font-medium">Chưa có lịch hẹn</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tiền sử bệnh</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalData?.medical_history ? (
                    <p>{modalData?.medical_history}</p>
                  ) : (
                    <p className="text-muted-foreground">Không có thông tin</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dị ứng</CardTitle>
                </CardHeader>
                <CardContent>
                  {modalData?.allergies ? (
                    <p>{modalData?.allergies}</p>
                  ) : (
                    <p className="text-muted-foreground">Không có thông tin</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Không có ghi chú</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments" className="pt-4">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {sortedTreatments?.length > 0 ? (
                  sortedTreatments?.map((treatment: any) => (
                    <Card key={treatment?.$id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {treatment?.treatment_name}
                          </CardTitle>
                          <Badge
                            variant={
                              treatment?.status === "completed"
                                ? "secondary"
                                : treatment?.status === "schedule"
                                  ? "outline"
                                  : treatment?.status === "progress"
                                    ? "default"
                                    : "destructive"
                            }
                          >
                            {treatment?.status === "completed"
                              ? "Hoàn thành"
                              : treatment?.status === "schedule"
                                ? "Đã lên lịch"
                                : treatment?.status === "progress"
                                  ? "Đang thực hiện"
                                  : "Hủy"}
                          </Badge>
                        </div>
                        <CardDescription>{formatDateToDisplay(treatment?.start_date)}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      Chưa có kế hoạch điều trị
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Bệnh nhân này chưa có kế hoạch điều trị nào
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="flex flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleViewFullProfile}
        >
          <FileText className="mr-2 h-4 w-4" />
          Xem hồ sơ đầy đủ
        </Button>
        <Button variant="outline" onClick={handleViewAppointmentHistory}>
          <History className="mr-2 h-4 w-4" />
          Lịch sử khám
        </Button>
        <Button onClick={handleScheduleAppointment}>
          <Calendar className="mr-2 h-4 w-4" />
          Đặt lịch hẹn
        </Button>
      </div>
    </div>
  );
}
