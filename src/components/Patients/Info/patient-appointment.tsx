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
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, Clock, X, AlertTriangle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appointmentService } from "@/api/appointment";
import { serviceService } from "@/api/service";
import { formatDateToDisplay, isPastDate } from "@/utils/date-utils";
import { doctorService } from "@/api/doctors";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentDialogSchema,
  type AppointmentDialogFormData,
} from "@/utils/validations";
import { generateNextCode } from "@/utils/generate-code";
import { timeSlots } from "@/components/Modal/appointments/modal-appointments";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleFromLabels } from "@/utils/role-from-label";

interface PatientAppointmentsProps {
  patient: any;
}

export function PatientAppointments({ patient }: PatientAppointmentsProps) {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] =
    useState(false);
  const form = useForm<AppointmentDialogFormData>({
    resolver: zodResolver(appointmentDialogSchema),
    defaultValues: {
      serviceId: "",
      doctorId: "",
      appointmentTime: "",
      notes: "",
    },
  });
  const queryClient = useQueryClient();

  const userRole = user?.labels ? getRoleFromLabels(user?.labels) : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  const isDoctor = userRole === "doctor";

  const { data: allAppointments } = useQuery({
    queryKey: ["all-appointments"],
    queryFn: () => appointmentService.fetchAppointmentDocuments(),
  });

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: () => serviceService.getServiceDocuments(),
  });

  const { data: doctors } = useQuery({
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

  const getDuration = (serviceId: string) => {
    const service = services?.find(
      (service: any) => service?.$id === serviceId
    );
    return service?.duration;
  };

  const getDoctor = (doctorId: string) => {
    const doctor = doctors?.data?.find(
      (doctor: any) => doctor?.$id === doctorId
    );
    return doctor?.name;
  };

  const onSubmit = async (data: AppointmentDialogFormData) => {
    const lastAppointmentCode = allAppointments?.data?.map(
      (appointment: any) => appointment?.appointment_code
    );
    const newAppointmentCode = generateNextCode({
      prefix: "APP",
      length: 2,
      existingCodes: lastAppointmentCode || [],
    });

    // Find the selected time slot
    const selectedTimeSlot = timeSlots.find(slot => slot.id === data.appointmentTime);

    try {
      const payload = {
        appointment_code: newAppointmentCode,
        appointment_date: dayjs(data.appointmentDate).format("YYYY-MM-DD"),
        appointment_time_range: selectedTimeSlot?.time || "", // Store the time value instead of ID
        services: data.serviceId,
        staffManagement: data.doctorId,
        status: "waiting",
        notes: data.notes || "",
        patients: patient?.$id,
        branch: patient?.branch?.$id,
      };
      await appointmentService.createAppointmentDocuments(payload);
      queryClient.invalidateQueries({
        queryKey: ["patients-personal-info"],
      });
      setShowNewAppointmentDialog(false);
      form.reset();
    } catch (error) {
      throw new Error("Lỗi khi tạo lịch hẹn");
    }
  };

  const getBookedTimeSlots = (selectedDate: Date, doctorId: string) => {
    if (!allAppointments) return [];

    return allAppointments?.data?.filter((appointment: any) => {
        const appointmentDate = dayjs(
          appointment?.appointment_date
        ).format("YYYY-MM-DD");
        const formattedSelectedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        return (
          appointmentDate === formattedSelectedDate &&
          appointment?.staffManagement?.$id === doctorId
        );
      })
      .map((appointment: any) => appointment?.appointment_time?.$id);
  };

  const isTimeSlotBooked = (
    timeSlotId: string,
    selectedDate: Date,
    doctorId: string
  ) => {
    const bookedSlots = getBookedTimeSlots(selectedDate, doctorId);
    return bookedSlots.includes(timeSlotId);
  };

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointmentDocuments(id, {
        status: "cancel",
      });
      queryClient.refetchQueries({
        queryKey: ["patients-personal-info"],
      });
    } catch (error) {
      throw new Error("Error canceling appointment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch Hẹn</h2>
        <Button onClick={() => setShowNewAppointmentDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Đặt lịch hẹn
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="flex flex-col h-[calc(100vh-350px)]">
          <CardHeader>
            <CardTitle>Lịch Hẹn Sắp Tới</CardTitle>
            <CardDescription>Danh sách các lịch hẹn đã đặt</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {patient?.appointments?.length > 0 ? (
              <div className="space-y-4">
                {patient?.appointments?.map((appointment: any) => (
                  <Card key={appointment?.$id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {appointment?.services?.name}
                        </CardTitle>
                        <Badge
                          variant={
                            appointment?.status === "confirm"
                              ? "default"
                              : appointment?.status === "waiting"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {appointment?.status === "confirm"
                            ? "Đã xác nhận"
                            : appointment?.status === "waiting"
                            ? "Chưa xác nhận"
                            : "Đã hủy"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateToDisplay(
                          appointment?.appointment_date
                        )}{" "}
                        - {appointment?.appointment_time_range} (
                        {getDuration(appointment?.services?.$id)} phút)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Bác sĩ:</span>
                          <span>
                            BS.{getDoctor(appointment?.staffManagement?.$id)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Đổi lịch
                      </Button>
                      {appointment?.status !== "cancel" && (
                        <Button
                          variant="outline"
                          size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => cancelAppointment(appointment?.$id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                          Hủy lịch
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Không có lịch hẹn</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Bệnh nhân này chưa có lịch hẹn nào sắp tới
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setShowNewAppointmentDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Đặt lịch hẹn
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Lịch</CardTitle>
            <CardDescription>Chọn ngày để đặt lịch hẹn</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card> */}
      </div>

      <Dialog
        open={showNewAppointmentDialog}
        onOpenChange={(open) => {
          setShowNewAppointmentDialog(open);
          if (!open) {
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Đặt Lịch Hẹn Mới</DialogTitle>
            <DialogDescription>
              Đặt lịch hẹn mới cho bệnh nhân {patient.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dịch vụ</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                name="appointmentDate"
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
                      selected={field.value ? new Date(field.value) : undefined}
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
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giờ hẹn</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        !form.watch("doctorId") ||
                        !form.watch("appointmentDate")
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !form.watch("doctorId")
                                ? "Vui lòng chọn bác sĩ trước"
                                : !form.watch("appointmentDate")
                                ? "Vui lòng chọn ngày trước"
                                : "Chọn giờ"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots?.map((timeSlot: any) => {
                          const isBooked = isTimeSlotBooked(
                            timeSlot.id,
                            form.watch("appointmentDate"),
                            form.watch("doctorId")
                          );
                          return (
                            <SelectItem
                              key={timeSlot.id}
                              value={timeSlot.id}
                              disabled={isBooked}
                            >
                              {timeSlot?.time}
                              {isBooked && " (Đã đặt)"}
                            </SelectItem>
                          );
                        })}
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
                      onValueChange={field.onChange}
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú thêm về lịch hẹn"
                        className="resize-none"
                        {...field}
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
                  onClick={() => setShowNewAppointmentDialog(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">Đặt lịch</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
