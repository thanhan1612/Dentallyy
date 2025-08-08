"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Trash,
  CalendarIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { treatmentService } from "@/api/treatment";
import { serviceService } from "@/api/service";
import { doctorService } from "@/api/doctors";
import { formatDateToDisplay, isPastDate } from "@/utils/date-utils";
import { generateNextCode } from "@/utils/generate-code";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { ID } from "appwrite";
import { getRoleFromLabels } from "@/utils/role-from-label";
import { useAuth } from "@/contexts/AuthContext";

interface PatientTreatmentPlansProps {
  patient: any;
}

export function PatientTreatmentPlans({ patient }: PatientTreatmentPlansProps) {
  const [showNewTreatmentDialog, setShowNewTreatmentDialog] = useState(false);
  const form = useForm<any>();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userRole = user?.labels ? getRoleFromLabels(user?.labels) : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  const isDoctor = userRole === "doctor";

  const useGetPatientTreatment = () => {
    return useQuery({
      queryKey: ["patient-treatment"],
      queryFn: () =>
        treatmentService.getTreatmentDocuments({
          fieldId: "branch",
          value: patient?.branch?.$id,
        }),
    });
  };

  const useGetServices = () => {
    return useQuery({
      queryKey: ["services"],
      queryFn: () => serviceService.getServiceDocuments(),
    });
  };

  const useGetDoctors = () => {
    return useQuery({
      queryKey: ["doctors"],
      queryFn: async () => {
        if(isBranchAdmin || isDoctor) {
          return await doctorService.getDoctorDocuments({
            fieldId: "branch",
            value: patient?.branch?.$id,
          });
        }
        return await doctorService.getDoctorDocuments();
      },
    });
  };

  const { data: treatments, isLoading: isTreatmentsLoading } =
    useGetPatientTreatment();
  const { data: services, isLoading: isServicesLoading } = useGetServices();
  const { data: doctors, isLoading: isDoctorsLoading } = useGetDoctors();

  const onServiceChange = (value: string) => {
    const selectedService = services?.find(
      (service: any) => service?.$id === value
    );

    if (selectedService) {
      form.setValue("treatmentId", selectedService?.$id);
      form.setValue("price", selectedService?.cost || 0);
    }
  };

  const onDoctorChange = (value: string) => {
    const selectedDoctor = doctors?.data?.find(
      (doctor: any) => doctor?.$id === value
    );
    if (selectedDoctor) {
      form.setValue("doctorId", selectedDoctor?.$id);
    }
  };

  const onSubmit = async (data: any) => {
    const existingCodes = treatments?.data?.map((t: any) => t?.treatment_code);
    const treatmentCode = generateNextCode({
      prefix: "T",
      length: 3,
      existingCodes: existingCodes || [],
    });

    const payload = {
      patients: patient?.$id,
      staffManagement: [data.doctorId],
      treatment_name: data.name,
      services: data.treatmentId,
      start_date: dayjs(data.startDate).format("YYYY-MM-DD"),
      status: "schedule",
      price: data.price,
      treatment_code: treatmentCode,
      branch: patient?.branch?.$id,
      isDeleted: false,
      patient_name: patient?.name,
    };
    try {
      await treatmentService.createTreatmentDocument(payload);
      queryClient.refetchQueries({
        queryKey: ["patient-personal-info", patient?.$id],
      });
      setShowNewTreatmentDialog(false);
    } catch (error) {
      throw new Error("Lỗi khi tạo kế hoạch điều trị");
    }
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    try {
      await treatmentService.updateTreatmentDocument(treatmentId, {
        isDeleted: true,
      });
      queryClient.refetchQueries({
        queryKey: ["patient-personal-info", patient?.$id],
      });
    } catch (error) {
      throw new Error("Lỗi khi xóa kế hoạch điều trị");
    }
  };

  if (isTreatmentsLoading || isServicesLoading || isDoctorsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kế Hoạch Điều Trị</h2>
        <Button onClick={() => setShowNewTreatmentDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm kế hoạch
        </Button>
      </div>

      <div className="space-y-4">
        {patient?.treatment && patient?.treatment?.length > 0 ? (
          patient?.treatment
            ?.filter((treatment: any) => !treatment?.isDeleted)
            .map((treatment: any) => (
              <Card key={treatment?.$id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {treatment?.treatment_name}
                    </CardTitle>
                    <Badge
                      variant={
                        treatment?.status === "schedule"
                          ? "secondary"
                          : treatment?.status === "progress"
                          ? "default"
                          : "outline"
                      }
                    >
                      {treatment?.status === "schedule"
                        ? "Mới"
                        : treatment?.status === "progress"
                        ? "Đang điều trị"
                        : "Hoàn thành"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateToDisplay(treatment?.start_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Bác sĩ:</span>
                      <span>BS. {treatment?.staffManagement?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Thời gian:</span>
                      <span>{treatment?.services?.duration || 0} phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Chi phí:</span>
                      <span>{treatment?.price || 0} VNĐ</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Đổi lịch
                  </Button>
                  {treatment?.status === "schedule" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTreatment(treatment?.$id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                  )}
                  {treatment?.status === "completed" && (
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Xem kết quả
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Chưa có kế hoạch điều trị</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Bệnh nhân này chưa có kế hoạch điều trị nào
            </p>
            <Button
              className="mt-4"
              onClick={() => setShowNewTreatmentDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm kế hoạch điều trị
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={showNewTreatmentDialog}
        onOpenChange={setShowNewTreatmentDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Kế Hoạch Điều Trị Mới</DialogTitle>
            <DialogDescription>
              Tạo kế hoạch điều trị mới cho bệnh nhân {patient.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên điều trị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên điều trị"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày hẹn</FormLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal border-sidebar-border",
                              !field.value && "text-muted-foreground"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {field.value ? (
                              formatDateToDisplay(field.value)
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-2 border-sidebar-border"
                        align="start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => isPastDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch vụ</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onServiceChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn dịch vụ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services?.map((service: any) => (
                          <SelectItem key={service?.$id} value={service?.$id}>
                            {service?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bác sĩ</FormLabel>
                    <Select
                      onValueChange={onDoctorChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn bác sĩ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.data?.map((doctor: any) => (
                          <SelectItem key={doctor?.$id} value={doctor?.$id}>
                            {doctor?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi phí (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập chi phí điều trị"
                        {...field}
                        value={field.value || 0}
                        disabled={true}
                        className="bg-muted-foreground/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowNewTreatmentDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
