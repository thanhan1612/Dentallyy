import { CalendarIcon, Clock, FileText, UserCheck } from "lucide-react";
import dayjs from "dayjs";

interface ConfirmationSectionProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  selectedService: any;
  selectedDoctor: any;
}

export function ConfirmationSection({
  selectedDate,
  selectedTime,
  selectedService,
  selectedDoctor,
}: ConfirmationSectionProps) {
  if (!selectedService || !selectedDoctor || !selectedTime) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Xác Nhận Lịch Hẹn</h3>

      <div className="rounded-lg border p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>
              {selectedDate &&
                dayjs(selectedDate).format("dddd, DD/MM/YYYY")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {selectedTime} ({selectedService?.duration} phút)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{selectedService.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span>{selectedDoctor.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 