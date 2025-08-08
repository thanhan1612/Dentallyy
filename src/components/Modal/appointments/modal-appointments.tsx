"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { appointmentSchema } from "@/utils/validations";
import { AppointmentFormData } from "@/utils/validations";
import { useModal } from "@/contexts/modal-context";
import { serviceService } from "@/api/service";
import { appointmentService } from "@/api/appointment";
import { patientsService } from "@/api/patients";
import { generateNextCode } from "@/utils/generate-code";
import { useAuth } from "@/contexts/AuthContext";
import { doctorService } from "@/api/doctors";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { useQuery } from "@tanstack/react-query";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { authService } from "@/api/auth";
import { getRoleFromLabels } from "@/utils/role-from-label";

import { PatientSection } from "./components/PatientSection";
import { AppointmentSection } from "./components/AppointmentSection";
import { ConfirmationSection } from "./components/ConfirmationSection";

export const timeSlots = [
  { id: "1", time: "08:00" },
  { id: "2", time: "09:00" },
  { id: "3", time: "10:00" },
  { id: "4", time: "11:00" },
  { id: "5", time: "13:00" },
  { id: "6", time: "14:00" },
  { id: "7", time: "15:00" },
  { id: "8", time: "16:00" },
];

export function AppointmentCreateForm() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [suggestedTimes, setSuggestedTimes] = useState<
    { time: string; isBooked: boolean; id: string }[]
  >([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    id: string;
    time: string;
  } | null>(null);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const { closeModal, modalData } = useModal();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close popover when modal closes
  useEffect(() => {
    if (!modalData) {
      setPopoverOpen(false);
    }
  }, [modalData]);

  const userRole = user?.labels ? getRoleFromLabels(user?.labels) : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  const isDoctor = userRole === "doctor";

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
  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const useGetBranches = () => {
    return useQuery({
      queryKey: ["branch-documents"],
      queryFn: () => authService.fetchBranchDocuments(),
    });
  };

  const useGetDoctors = () => {
    return useQuery({
      queryKey: ["doctor-documents"],
      queryFn: async () => {
        if (isBranchAdmin || isDoctor) {
          return await doctorService.getDoctorDocuments({
            fieldId: "branch",
            value: user?.[0]?.branch?.$id,
          });
        }
        return await doctorService.getDoctorDocuments();
      },
    });
  };

  const useGetServices = () => {
    return useQuery({
      queryKey: ["service-documents"],
      queryFn: () => serviceService.getServiceDocuments(),
    });
  };

  const useGetAppointments = () => {
    return useQuery({
      queryKey: ["appointment-documents"],
      queryFn: () => appointmentService.fetchAppointmentDocuments(),
    });
  };

  const { data: patients } = useGetPatients();
  const { data: branches, isLoading: isLoadingBranches } = useGetBranches();
  const { data: doctors, isLoading: isLoadingDoctors } = useGetDoctors();
  const { data: services, isLoading: isLoadingServices } = useGetServices();
  const { data: appointments, isLoading: isLoadingAppointments } =
    useGetAppointments();

  const isLoading =
    isLoadingBranches ||
    isLoadingDoctors ||
    isLoadingServices ||
    isLoadingAppointments;

  const isEditMode = !!modalData?.appointmentId;
  const title = isEditMode ? "Chỉnh Sửa Lịch Hẹn" : "Tạo Lịch Hẹn Mới";
  const description = isEditMode
    ? "Chỉnh sửa thông tin lịch hẹn. Nhấn lưu khi hoàn tất."
    : "Nhập thông tin lịch hẹn mới. Nhấn lưu khi hoàn tất.";

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientType: "existing",
      patientId: "",
      date: new Date(),
      time: "",
      serviceId: "",
      doctorId: "",
      branchId: "",
      notes: "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");
  const selectedServiceId = form.watch("serviceId");
  const selectedDoctorId = form.watch("doctorId");

  // Watch for changes in date, doctor, or service to update suggested times
  useEffect(() => {
    if (selectedService?.duration) {
      generateSuggestedTimes(parseInt(selectedService.duration));
    }
  }, [selectedDate, selectedDoctorId, selectedService, bookedTimes]);

  // Generate suggested times based on service duration and doctor availability
  const generateSuggestedTimes = useCallback((duration: number) => {
    // Only generate times if we have all required selections
    if (!selectedDate || !selectedDoctorId || !selectedServiceId) {
      setSuggestedTimes([]);
      return;
    }

    const now = new Date();
    const isToday = dayjs(selectedDate).isSame(dayjs(now), "day");
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    //Get all time slots
    const allTimeSlots = timeSlots?.map((time: any) => {
      const timeStr = time?.time;
      let isPastTime = false;

      if (isToday && timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        // Check if the time slot is in the past
        isPastTime =
          hours < currentHour ||
          (hours === currentHour && minutes <= currentMinute);
      }

      return {
        id: time.id,
        time: timeStr,
        isBooked: bookedTimes.has(timeStr) || isPastTime,
      };
    });

    setSuggestedTimes(allTimeSlots);
  }, [selectedDate, selectedDoctorId, selectedServiceId, bookedTimes]);

  // Update selected service when serviceId changes
  const onServiceChange = useCallback((serviceId: string) => {
    const service = services?.find((s: any) => s?.$id === serviceId);
    setSelectedService(service);
    form.setValue("serviceId", serviceId);
    // Reset time selection when service changes
    setSelectedTimeSlot(null);
    form.setValue("time", "");
  }, [services, form]);

  // Update selected doctor when doctorId changes
  const onDoctorChange = useCallback((doctorId: string) => {
    const doctor = doctors?.data?.find((d: any) => d?.$id === doctorId);
    setSelectedDoctor(doctor);
    form.setValue("doctorId", doctorId);
    // Reset time selection when doctor changes
    setSelectedTimeSlot(null);
    form.setValue("time", "");
  }, [doctors, form]);

  // Update selected patient when patientId changes
  const onPatientChange = useCallback((patientId: string) => {
    const patient = patients?.data?.find((p: any) => p?.$id === patientId);
    setSelectedPatient(patient);
    form.setValue("patientId", patientId);
  }, [patients, form]);

  // Update booked times when date or doctor changes
  useEffect(() => {
    if (selectedDate && selectedDoctorId) {
      const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
      const bookedSlots = new Set<string>();

      // Get all appointments for the selected date and doctor
      appointments?.data?.forEach((appointment: any) => {
        if (!appointment?.appointment_date) return;
        const appointmentDateStr = appointment?.appointment_date;
        const appointmentDate = dayjs(appointmentDateStr).format("YYYY-MM-DD");
        if (
          appointmentDate === dateStr &&
          appointment?.staffManagement?.$id === selectedDoctorId
        ) {
          if (appointment?.appointment_time_range) {
            bookedSlots.add(appointment?.appointment_time_range);
          }
        }
      });
      setBookedTimes(bookedSlots);
      // Reset time selection if current selected time is now booked
      if (selectedTimeSlot && bookedSlots.has(selectedTimeSlot.time)) {
        setSelectedTimeSlot(null);
        form.setValue("time", "");
      }
    }
  }, [selectedDate, selectedDoctorId, modalData, appointments, selectedTimeSlot, form]);

  // Update selected branch when branchId changes
  const onBranchChange = useCallback((branchId: string) => {
    const branch = branches?.find((b: any) => b?.$id === branchId);
    setSelectedBranch(branch);
    form.setValue("branchId", branchId);
    // Reset doctor selection when branch changes
    setSelectedDoctor(null);
    form.setValue("doctorId", "");
  }, [branches, form]);

  const fetchMorePatients = useCallback(() => {
    if (!isLoadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setIsSaving(true);
      // Check if time slot is selected
      if (!selectedTimeSlot) {
        form.setError("time", {
          type: "manual",
          message: "Vui lòng chọn thời gian khám",
        });
        return;
      }

      let patientId = data.patientId;

      // If it's a new patient, create patient first
      if (data.patientType === "new") {
        // Generate new patient code
        const patientCodes = patients?.total
        const newPatientCode = generateNextCode({
          prefix: "P",
          length: 3,
          existingCodes: [patientCodes?.toString() || ""],
        });

        // Create new patient
        const patientPayload = {
          name: data.patientName,
          phone: data.patientPhone,
          email: data.patientEmail,
          patient_code: newPatientCode,
          isDeleted: false,
        };

        const patientResponse = await patientsService.createPatientDocument(
          patientPayload
        );
        patientId = patientResponse?.$id;
      }

      // Generate appointment code
      const appointmentCodes =
        appointments?.data?.map(
          (appointment: any) => appointment?.appointment_code
        ) || [];
      const appointmentCode = generateNextCode({
        prefix: "APP",
        length: 2,
        existingCodes: appointmentCodes,
      });

      const appointmentPayload = {
        appointment_code: appointmentCode,
        appointment_date: dayjs(data.date).format("YYYY-MM-DD"),
        appointment_time_range: selectedTimeSlot?.time,
        services: [data.serviceId],
        staffManagement: [data.doctorId],
        patients: patientId,
        status: "waiting",
        notes: data.notes || "",
        branch: data.branchId,
      };

      await appointmentService.createAppointmentDocuments(appointmentPayload);

      if (modalData?.[0]?.onSuccess) {
        modalData[0].onSuccess(true);
      }
      closeModal();
    } catch (error) {
      throw error;
    } finally {
      setIsSaving(false);
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
          className="space-y-6 max-h-[calc(100vh-350px)] overflow-y-auto pr-2"
        >
          <PatientSection
            form={form}
            allPatients={allPatients}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fetchMorePatients={fetchMorePatients}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
            popoverOpen={popoverOpen}
            setPopoverOpen={setPopoverOpen}
          />

          <AppointmentSection
            form={form}
            branches={branches || []}
            doctors={doctors || []}
            services={services || []}
            selectedDoctor={selectedDoctor}
            selectedService={selectedService}
            selectedTimeSlot={selectedTimeSlot}
            setSelectedTimeSlot={setSelectedTimeSlot}
            suggestedTimes={suggestedTimes}
            onBranchChange={onBranchChange}
            onDoctorChange={onDoctorChange}
            onServiceChange={onServiceChange}
            selectedBranch={selectedBranch}
          />

          <ConfirmationSection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedService={selectedService}
            selectedDoctor={selectedDoctor}
          />
        </form>

        <div className="flex justify-end gap-2 mt-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-sidebar-border"
            onClick={closeModal}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="border-sidebar-border"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </Form>
    </>
  );
}
