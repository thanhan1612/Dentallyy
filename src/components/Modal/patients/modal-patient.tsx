import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PatientFormData, patientSchema } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModal } from "@/contexts/modal-context";
import { patientsService } from "@/api/patients";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { authService } from "@/api/auth";
import { formatDateToDisplay } from "@/utils/date-utils";

const CustomCalendar = ({ selected, onSelect, disabled }: any) => {
  const [currentYear, setCurrentYear] = useState(
    selected ? dayjs(selected).year() : dayjs().year()
  );
  const [currentMonth, setCurrentMonth] = useState(
    selected ? dayjs(selected).month() : dayjs().month()
  );

  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => 1900 + i
  ).reverse();

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    const newDate = dayjs(selected || new Date())
      .year(year)
      .toDate();
    onSelect(newDate);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <Select
          value={currentYear.toString()}
          onValueChange={(value) => handleYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-full h-7 text-sm">
            <SelectValue>{currentYear}</SelectValue>
          </SelectTrigger>
          <SelectContent
            className="max-h-[200px]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                className="text-sm h-7"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        month={new Date(currentYear, currentMonth)}
        onMonthChange={(date) => {
          setCurrentMonth(date.getMonth());
          setCurrentYear(date.getFullYear());
        }}
        initialFocus
      />
    </div>
  );
};

export function ModalPatient() {
  const { closeModal, modalData } = useModal();
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const useBranchDocuments = () => {
    return useQuery({
      queryKey: ["branches"],
      queryFn: () => authService.fetchBranchDocuments(),
    });
  };

  const { data: branches, isLoading: isLoadingBranches } = useBranchDocuments();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      dob: undefined,
      gender: "Nam",
      phone: "",
      email: undefined,
      address: "",
      medical_history: "",
      allergies: "",
      branchId: "",
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSaving(true);
    const payload = {
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address,
      medical_history: data.medical_history || undefined,
      allergies: data.allergies || undefined,
      patient_code: modalData.lastPatientCode,
      isDeleted: false,
      branch: data.branchId,
      //createdDate: [new Date()],
      treatment_status: "new",
    };

    try {
      await patientsService.createPatientDocument(payload);
      if (modalData.onSuccess) {
        modalData.onSuccess(true);
      }
      closeModal();
    } catch (error) {
      if (modalData.onSuccess) {
        modalData.onSuccess(false);
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find((b: any) => b.id === branchId);
    setSelectedBranch(branch);
    form.setValue("branchId", branchId);
  };

  return (
    <>
      {isLoadingBranches && <LoadingScreen />}
      <div className="flex flex-col gap-2">
        <DialogTitle>Đăng Ký Bệnh Nhân Mới</DialogTitle>
        <DialogDescription>
          Nhập thông tin bệnh nhân mới. Nhấn lưu khi hoàn tất.
        </DialogDescription>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 mt-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập họ và tên" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
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
                    <CustomCalendar
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date: any) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
                      disabled={(date: any) => {
                        const today = dayjs().startOf("day");
                        const selectedDate = dayjs(date).startOf("day");
                        return selectedDate.isAfter(today);
                      }}
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    defaultValue="Nam"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent className="border-sidebar-border">
                      <SelectItem value="Nam">Nam</SelectItem>
                      <SelectItem value="Nữ">Nữ</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập số điện thoại" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nhập email"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Không bắt buộc
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Chi Nhánh</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={handleBranchChange}
                    disabled={
                      (
                        user?.[0]?.role === "doctor" ||
                        user?.[0]?.role === "branch_admin" ||
                        user?.labels?.includes("DOCTOR") ||
                        user?.labels?.includes("BADMIN")
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch: any) => (
                        <SelectItem key={branch?.$id} value={branch?.$id}>
                          {branch?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập địa chỉ" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="medical_history"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ghi chú về tiền sử bệnh của bệnh nhân"
                    className="resize-none min-h-[80px]"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Không bắt buộc
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Dị ứng</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ghi chú về các dị ứng của bệnh nhân"
                    className="resize-none min-h-[80px]"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground">
                  Không bắt buộc
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
        <div className="col-span-2 gap-2 flex justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            className="border-sidebar-border"
            onClick={closeModal}
            disabled={isLoadingBranches || isSaving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="border-sidebar-border"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoadingBranches || isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </Form>
    </>
  );
}
