import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentFormData } from "@/types/appointment";
import { TIME_SLOTS } from "@/types/appointment";
import dayjs from "dayjs";

interface Doctor {
  $id: string;
  name: string;
  doctor_avatar?: string;
  specialty?: string;
}

interface Service {
  $id: string;
  name: string;
  duration: number;
}

interface Branch {
  $id: string;
  name: string;
}

interface AppointmentSectionProps {
  form: ReturnType<typeof useForm<AppointmentFormData>>;
  branches: Branch[];
  doctors: { data: Doctor[] };
  services: Service[];
  selectedDoctor: Doctor | null;
  selectedService: Service | null;
  selectedBranch: Branch | null;
  selectedTimeSlot: { id: string; time: string } | null;
  setSelectedTimeSlot: (slot: { id: string; time: string } | null) => void;
  suggestedTimes: { time: string; isBooked: boolean; id: string }[];
  onBranchChange: (branchId: string) => void;
  onDoctorChange: (doctorId: string) => void;
  onServiceChange: (serviceId: string) => void;
}

export function AppointmentSection({
  form,
  branches,
  doctors,
  services,
  selectedDoctor,
  selectedService,
  selectedTimeSlot,
  selectedBranch,
  setSelectedTimeSlot,
  suggestedTimes,
  onBranchChange,
  onDoctorChange,
  onServiceChange,
}: AppointmentSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Thông Tin Lịch Hẹn</h3>

      <div className="grid grid-cols-2 gap-4 mt-4 space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày Hẹn</FormLabel>
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
                    disabled={(date) => {
                      return dayjs(date).isBefore(dayjs(), "day");
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
                  {branches?.map((branch) => (
                    <SelectItem key={branch.$id} value={branch.$id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {selectedBranch && (
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bác Sĩ</FormLabel>
                <Select
                  onValueChange={onDoctorChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.data?.map((doctor) => (
                      <SelectItem key={doctor.$id} value={doctor.$id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={doctor.doctor_avatar || ""}
                              alt={doctor.name}
                            />
                            <AvatarFallback>
                              {doctor.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{doctor.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dịch Vụ</FormLabel>
              <Select onValueChange={onServiceChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn dịch vụ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services?.map((service) => (
                    <SelectItem key={service.$id} value={service.$id}>
                      {service.name} ({service.duration} phút)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {suggestedTimes.length > 0 && (
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ hẹn khả dụng</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {suggestedTimes?.map(({ time, isBooked, id }) => (
                    <Button
                      key={id}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBooked}
                      onClick={() => {
                        field.onChange(time);
                        setSelectedTimeSlot({ id, time });
                      }}
                      className={cn(
                        "flex items-center gap-1 border-sidebar-border",
                        field.value === time && "border-primary",
                        isBooked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {time}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {selectedDoctor && (
        <div className="mt-2 rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={selectedDoctor.doctor_avatar || ""}
                alt={selectedDoctor.name}
              />
              <AvatarFallback>
                {selectedDoctor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-medium">{selectedDoctor.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedDoctor.specialty}
              </p>
            </div>
          </div>
        </div>
      )}

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi Chú</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt"
                className="min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>Không bắt buộc</FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
} 