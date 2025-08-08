"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash, CalendarIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { treatmentService } from "@/api/treatment";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { formatDateToDisplay } from "@/utils/date-utils";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { generateNextCode } from "@/utils/generate-code";
import { doctorService } from "@/api/doctors";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleFromLabels } from "@/utils/role-from-label";

const treatmentFormSchema = z.object({
  treatmentName: z.string().min(1, "Vui lòng nhập tên điều trị"),
  startDate: z.date(),
  status: z.enum(["schedule", "process", "completed", "cancel"], {
    required_error: "Vui lòng chọn trạng thái",
  }),
  doctor: z.string().min(1, "Vui lòng chọn bác sĩ"),
  treatment_description: z.string().optional(),
});

type TreatmentFormData = z.infer<typeof treatmentFormSchema>;

interface RecordTreatmentsProps {
  record: any;
}

export function RecordTreatments({ record }: RecordTreatmentsProps) {
  console.log(record);
  const [showAddTreatmentDialog, setShowAddTreatmentDialog] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userRole = user?.labels ? getRoleFromLabels(user?.labels) : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  const isDoctor = userRole === "doctor";

  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: {
      treatmentName: "",
      startDate: new Date(),
      status: "schedule",
      treatment_description: "",
      doctor: "",
    },
  });

  const useGetTreatmentDocuments = () => {
    return useQuery({
      queryKey: ["treatment-documents"],
      queryFn: () =>
        treatmentService.getTreatmentDocuments({
          fieldId: "branch",
          value: record?.branch?.$id,
        }),
    });
  };

  const useGetDoctorDocuments = () => {
    return useQuery({
      queryKey: ["doctor-documents"],
      queryFn: async () => {
        if(isBranchAdmin || isDoctor) {
          return await doctorService.getDoctorDocuments({
            fieldId: "branch",
            value: record?.branch?.$id,
          });
        }
        return await doctorService.getDoctorDocuments();
      },
    });
  };

  const { data: treatments, isLoading: isTreatmentsLoading } =
    useGetTreatmentDocuments();
  const { data: doctors, isLoading: isDoctorsLoading } =
    useGetDoctorDocuments();

  const onSubmit = async (data: TreatmentFormData) => {
    if (editingTreatment) {
      // Update existing treatment
      const payload = {
        treatment_name: data.treatmentName,
        start_date: dayjs(data.startDate).format("YYYY-MM-DD"),
        status: data.status,
        treatment_description: data.treatment_description,
      };
      await treatmentService.updateTreatmentDocument(
        editingTreatment?.$id,
        payload
      );
    } else {
      const treatmentCode = treatments?.total
      
      const newTreatmentCode = generateNextCode({
        prefix: "T",
        length: 3,
        existingCodes: [treatmentCode?.toString() || ""],
      });
      const payload = {
        patients: record?.$id,
        treatment_name: data.treatmentName,
        start_date: dayjs(data.startDate).format("YYYY-MM-DD"),
        status: data.status,
        treatment_description: data.treatment_description,
        branch: record?.branch?.$id,
        staffManagement: [data.doctor],
        isDeleted: false,
        treatment_code: newTreatmentCode,
        patient_name: record?.name,
      };
      await treatmentService.createTreatmentDocument(payload);
    }
    await queryClient.invalidateQueries({
      queryKey: ["patient-info", record?.$id],
    });
    setShowAddTreatmentDialog(false);
    setEditingTreatment(null);
    form.reset();
  };

  const handleEditTreatment = (treatment: any) => {
    setEditingTreatment(treatment?.$id);
    form.reset({
      treatmentName: treatment?.treatment_name,
      startDate: new Date(treatment?.start_date),
      status: treatment?.status,
      treatment_description: treatment?.treatment_description || "",
      doctor: treatment?.staffManagement?.$id,
    });
    setShowAddTreatmentDialog(true);
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    await treatmentService.updateTreatmentDocument(treatmentId, {
      isDeleted: true,
    });
    await queryClient.invalidateQueries({
      queryKey: ["patient-info", record?.$id],
    });
  };

  const handleCloseDialog = () => {
    setShowAddTreatmentDialog(false);
    setEditingTreatment(null);
    form.reset();
  };

  if (isTreatmentsLoading || isDoctorsLoading) return <LoadingScreen />;

  console.log(record);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch Sử Điều Trị</h2>
        <Button onClick={() => setShowAddTreatmentDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm điều trị
        </Button>
      </div>
      <div className="space-y-4">
        {record?.treatment && record?.treatment?.length > 0 ? (
          record?.treatment
            ?.filter((treatment: any) => !treatment?.isDeleted)
            .map((treatment: any) => (
              <Card key={treatment?.$id} className="gap-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {treatment?.treatment_name}
                    </CardTitle>
                    <Badge
                      variant={
                        treatment?.status === "completed"
                          ? "secondary"
                          : treatment?.status === "schedule"
                          ? "outline"
                          : "default"
                      }
                    >
                      {treatment?.status === "schedule"
                        ? "Đã lên lịch"
                        : treatment?.status === "process"
                        ? "Đang thực hiện"
                        : treatment?.status === "completed"
                        ? "Hoàn thành"
                        : "Đã hủy"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateToDisplay(treatment?.start_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    {treatment?.treatment_description || "Không có ghi chú"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTreatment(treatment)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  {treatment?.status === "schedule" || treatment?.status === "process" && (
                    <Button
                      variant="outline"
                      size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteTreatment(treatment?.$id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                  )}
                </CardFooter>
              </Card>
            ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Chưa có thông tin điều trị nào
              </p>
              <Button onClick={() => setShowAddTreatmentDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm điều trị
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showAddTreatmentDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTreatment ? "Chỉnh Sửa Điều Trị" : "Thêm Điều Trị Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingTreatment
                ? "Chỉnh sửa thông tin điều trị"
                : "Thêm thông tin về điều trị mới cho bệnh nhân"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="treatmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên điều trị</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nhập tên điều trị" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bác sĩ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
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
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày Hẹn</FormLabel>
                    <Popover>
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
                              dayjs(field.value).format("dddd, DD/MM/YYYY")
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: any) => {
                            const today = dayjs().startOf("day");
                            const selectedDate = dayjs(date).startOf("day");
                            return selectedDate.isBefore(today);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="schedule">Đã lên lịch</SelectItem>
                        <SelectItem value="process">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatment_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập ghi chú về điều trị"
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
                  onClick={handleCloseDialog}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingTreatment ? "Cập nhật" : "Lưu"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
