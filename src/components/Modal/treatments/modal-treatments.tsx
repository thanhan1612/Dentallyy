"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { treatmentSchema, TreatmentFormData } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { doctorService } from "@/api/doctors";
import { useModal } from "@/contexts/modal-context";
import { formatDateToDisplay, isPastDate } from "@/utils/date-utils";
import { treatmentService } from "@/api/treatment";
import { generateNextCode } from "@/utils/generate-code";
import { patientsService } from "@/api/patients";
import { serviceService } from "@/api/service";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "@/api/payment";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { authService } from "@/api/auth";
import { getRoleFromLabels } from "@/utils/role-from-label";
import { PatientSection } from "../appointments/components/PatientSection";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { PatientSelect } from "./components/PatientSelect";
import { PrescriptionList } from "./components/PrescriptionList";

export function ModalTreatments() {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<any>();
  const [selectedPatient, setSelectedPatient] = useState<any>();
  const [selectedDoctor, setSelectedDoctor] = useState<any>();
  const [selectedService, setSelectedService] = useState<any>();
  const { modalData, closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("schedule");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Close popover when modal closes
  useEffect(() => {
    if (!modalData) {
      setPopoverOpen(false);
    }
  }, [modalData]);

  const userRole = user?.labels ? getRoleFromLabels(user?.labels) : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  const isDoctor = userRole === "doctor";

  const useGetBranches = () => {
    return useQuery({
      queryKey: ["branches"],
      queryFn: () => authService.fetchBranchDocuments(),
    });
  };

  const useGetTreatmentsById = (id: string) => {
    return useQuery({
      queryKey: ["treatments", id],
      queryFn: () => treatmentService.getTreatmentsByPatientId(id),
      enabled: !!id,
    });
  };

  const useGetPatients = () => {
    return useQuery({
      queryKey: ["patient-documents", page, debouncedSearch],
      queryFn: async () => {
        setIsLoadingMore(true);
        try {
          const response = await patientsService.getPatientDocuments(
            undefined,
            20,
            (page - 1) * 20,
            debouncedSearch
          );

          if (page === 1) {
            setAllPatients(response?.data || []);
          } else {
            const newPatients = (response?.data || []).filter(
              (newPatient) =>
                !allPatients.some(
                  (existingPatient) => existingPatient.$id === newPatient.$id
                )
            );
            setAllPatients((prev) =>
              page === 1
                ? newPatients
                : [...prev, ...newPatients.filter((np: any) => !prev.some((p) => p.$id === np.$id))]
            );
          }

          setHasMore((response?.data || []).length === 20);
          return response;
        } finally {
          setIsLoadingMore(false);
        }
      },
      staleTime: 3000,
    });
  };

  const fetchMorePatients = useCallback(() => {
    if (!isLoadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore]);

  const useGetDoctors = () => {
    return useQuery({
      queryKey: ["doctors"],
      queryFn: async() => {
        if(isBranchAdmin || isDoctor) {
          return await doctorService.getDoctorDocuments({
            fieldId: 'branch',
            value: user?.[0]?.branch?.$id
          });
        }
        return await doctorService.getDoctorDocuments();
      },
    });
  };

  const useGetServices = () => {
    return useQuery({
      queryKey: ["services"],
      queryFn: () => serviceService.getServiceDocuments(),
    });
  };

  const { data: branches, isLoading: isLoadingBranches } = useGetBranches();

  const { data: treatments, isLoading: isLoadingTreatments } =
    useGetTreatmentsById(modalData?.treatment?.$id);

  const { data: patients, isLoading: isLoadingPatients } = useGetPatients();

  const { data: doctors, isLoading: isLoadingDoctors } = useGetDoctors();

  const { data: services, isLoading: isLoadingServices } = useGetServices();

  const isLoading =
    isLoadingBranches ||
    isLoadingDoctors ||
    isLoadingServices ||
    isLoadingTreatments ||
    isLoadingPatients;

  const isEditMode = !!modalData?.treatment?.$id;
  const title = isEditMode ? "Chỉnh Sửa Điều Trị" : "Tạo Điều Trị Mới";
  const description = isEditMode
    ? "Chỉnh sửa thông tin điều trị. Nhấn lưu khi hoàn tất."
    : "Nhập thông tin điều trị mới. Nhấn lưu khi hoàn tất.";

  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      branchId: treatments?.branch?.$id || "",
      patientId: modalData?.data?.$id || treatments?.patients?.$id || "",
      doctorId: treatments?.staffManagement?.$id || "",
      startDate: treatments?.start_date || undefined,
      price: treatments?.price || 0,
      treatmentName: treatments?.treatment_name || "",
      treatmentId: treatments?.services?.$id || "",
      treatment_description: treatments?.treatment_description || "",
      status: treatments?.status || "schedule",
      quantity: treatments?.quantity || 1,
      promotion: treatments?.promotion || 0,
    },
  });

  useEffect(() => {
    if (treatments) {
      const fields = treatments;
      form.reset({
        branchId: fields.branch?.$id || "",
        patientId: fields.patients?.$id || "",
        doctorId: fields.staffManagement?.[0]?.$id || "",
        startDate: fields.start_date ? new Date(fields.start_date) : undefined,
        price: fields.price || 0,
        treatmentName: fields.treatment_name || "",
        treatmentId: fields.services?.$id || "",
        treatment_description: fields.treatment_description || "",
        status: fields.status || "schedule",
        quantity: fields.amount || 1,
        promotion: fields.promotion || 0,
      });

      // Set selected items
      if (fields.branch) setSelectedBranch(fields.branch);
      if (fields.patients) setSelectedPatient(fields.patients);
      if (fields.staffManagement) setSelectedDoctor(fields.staffManagement);
      if (fields.services) setSelectedService(fields.services);
      // Set selected status
      setSelectedStatus(fields.status || "schedule");
    } else if (modalData?.$id && allPatients) {
      const patient = allPatients?.find(
        (p: any) => p?.$id === modalData?.$id
      );
      if (patient) {
        setSelectedPatient(patient);
        form.setValue("patientId", patient?.$id);
      }
    }
  }, [treatments, modalData?.$id, allPatients]);

  // Watch for changes in quantity, promotion, and service to update price
  const quantity = form.watch("quantity");
  const promotion = form.watch("promotion");
  const status = form.watch("status");

  // Update selectedStatus when form status changes
  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  // Calculate price
  useEffect(() => {
    if (selectedService?.cost) {
      let basePrice = selectedService.cost * (quantity || 1);
      
      // Add prescription price only when status is completed
      if (status === "completed" && treatments?.prescriptions) {
        const prescriptionTotal = treatments.prescriptions.reduce((acc: number, prescription: any) => {
          return acc + (prescription.price || 0);
        }, 0);
        basePrice += prescriptionTotal;
      }
      
      const finalPrice = Math.max(0, basePrice - (promotion || 0));
      form.setValue("price", finalPrice);
    }
  }, [selectedService, quantity, promotion, form, treatments?.prescriptions, status]);

  const onBranchChange = (branchId: string) => {
    const branch = branches?.find((b: any) => b?.$id === branchId);
    setSelectedBranch(branch);
    form.setValue("branchId", branchId);
  };

  const onPatientChange = (patientId: string) => {
    const patient = allPatients?.find((p: any) => p?.$id === patientId);
    setSelectedPatient(patient);
    form.setValue("patientId", patientId);
  };

  const onDoctorChange = (doctorId: string) => {
    const doctor = doctors?.data?.find((d: any) => d?.$id === doctorId);
    setSelectedDoctor(doctor);
    form.setValue("doctorId", doctorId);
  };

  const onServiceChange = (serviceId: string) => {
    const service = services?.find((s: any) => s?.$id === serviceId);
    setSelectedService(service);
    form.setValue("treatmentId", serviceId || "");
    form.setValue("price", service?.cost || 0);
  };

  const onSubmit = async (data: TreatmentFormData) => {
    try {
      setIsSubmitting(true);

      if (modalData?.treatment) {
        const updateData = {
          patients: data.patientId,
          staffManagement: [data.doctorId],
          treatment_name: data.treatmentName,
          services: data.treatmentId,
          start_date: dayjs(data.startDate).format("YYYY-MM-DD"),
          status: data.status,
          price: data.price,
          treatment_description: data.treatment_description,
          branch: data.branchId,
          amount: data.quantity,
          promotion: data.promotion,
        };
        await treatmentService.updateTreatmentDocument(
          modalData?.treatment.$id,
          updateData
        );

        // Create payment if status is "Hoàn thành"
        if (data?.status === "completed") {
          const today = new Date();
          const dueDate = new Date(today);
          dueDate.setDate(today.getDate() + 3);

          // Get existing payments to generate next invoice number
          const existingPayments = await paymentService.getPaymentDocuments();
          const existingInvoiceNums = existingPayments.total;
          const invoiceNum = generateNextCode({
            prefix: "PAY",
            length: 2,
            existingCodes: [existingInvoiceNums.toString() || ""],
          });

          const paymentPayload = {
            invoice_num: invoiceNum,
            patients: data.patientId,
            treatment_name: data.treatmentName,
            date: dayjs(today).format("YYYY-MM-DD"),
            cost: data.price,
            status: "unpaid",
            branch: data.branchId,
            treatment: modalData.treatment.$id,
            patient_name: selectedPatient?.name,
            treatment_code: modalData?.treatment?.treatment_code,
          };

          await paymentService.createPaymentDocument(paymentPayload);
        }
      } else {
        // Create new treatment
        const existingTreatments =
          await treatmentService.getTreatmentDocuments();
        const existingCodes = existingTreatments.total;
        const treatmentCode = generateNextCode({
          prefix: "T",
          length: 3,
          existingCodes: [existingCodes.toString() || ""],
        });

        const treatmentData = {
          patients: data?.patientId || modalData?.data?.$id || "",
          staffManagement: [data?.doctorId || ""],
          treatment_name: data?.treatmentName,
          services: data?.treatmentId,
          start_date: dayjs(data?.startDate).format("YYYY-MM-DD"),
          status: data?.status,
          price: data?.price,
          treatment_description: data?.treatment_description,
          treatment_code: treatmentCode,
          branch: data?.branchId,
          isDeleted: false,
          patient_name: selectedPatient?.name,
          amount: data.quantity,
          promotion: data.promotion,
        };
        await treatmentService.createTreatmentDocument(
          treatmentData,
        );
      }

      await patientsService.updatePatientDocument(data.patientId, {
        treatment_status: data.status,
      })
      if (modalData?.onSuccess) {
        modalData?.onSuccess(true);
      }
      closeModal();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="flex flex-col gap-2">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]"
        >
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Chi Nhánh</FormLabel>
                <Select
                  onValueChange={onBranchChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch?.$id} value={branch?.$id}>
                        {branch?.name}
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
            name="patientId"
            render={({ field }) => (
              <PatientSelect
                field={field}
                form={form}
                setSelectedPatient={setSelectedPatient}
                disabled={!!modalData?.data?.$id || !!modalData?.treatment?.$id}
              />
            )}
          />
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bác sĩ</FormLabel>
                <Select value={field.value} onValueChange={onDoctorChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors?.data?.map((doctor: any) => (
                      <SelectItem key={doctor?.$id} value={doctor?.$id}>
                        BS.{doctor?.name}
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
            name="treatmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại điều trị</FormLabel>
                <Select value={field.value} onValueChange={onServiceChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn loại điều trị" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services?.map((treatment: any) => (
                      <SelectItem key={treatment?.$id} value={treatment?.$id}>
                        {treatment?.name}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promotion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khuyến mãi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                <FormLabel>Ngày bắt đầu</FormLabel>
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedStatus(value);
                  }}
                  defaultValue="schedule"
                  disabled={!modalData?.treatment?.$id}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="schedule">Đang lên lịch</SelectItem>
                    <SelectItem value="process">
                      Đang thực hiện
                    </SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="cancel">Hủy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedStatus === "completed" && treatments?.prescriptions && (
            <PrescriptionList prescriptions={treatments.prescriptions} />
          )}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chi phí (VNĐ)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={true}
                    className="bg-muted-foreground/20"
                    value={field.value || 0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="treatment_description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Mô tả</FormLabel>
                <Textarea {...field} className="resize-none min-h-[80px]" />
                <FormDescription className="text-muted-foreground">
                  Không bắt buộc
                </FormDescription>
              </FormItem>
            )}
          />
          <div className="col-span-2 gap-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-sidebar-border"
              onClick={closeModal}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="border-sidebar-border"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
