"use client";

import { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateToDB, formatDateFull } from "@/utils/date-utils";
import { getStatusText } from "@/utils/status-text";
export function AppointmentCalendar({ data }: { data: any[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (date && Array.isArray(data)) {
      const selectedDate = formatDateToDB(date);
      const filteredAppointments = data?.filter(
          (record: any) => formatDateToDB(record?.appointment_date) === selectedDate
      )
      setAppointments(filteredAppointments);
    }
  }, [date, data]);

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'grid grid-cols-12'} gap-6`}>
      <div className={`${isMobile ? 'w-full' : 'col-span-4'} bg-white rounded-lg border border-sidebar-border p-2 lg:p-4`}>
        <div className="w-full max-w-[280px] mx-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="w-full"
            classNames={{
              months: "w-full",
              month: "w-full",
              table: "w-full",
              head_row: "w-full flex justify-between",
              row: "w-full flex justify-between",
              head_cell:
                "text-muted-foreground rounded-md w-6 h-6 xl:w-10 xl:h-10 text-xs xl:text-sm flex items-center justify-center",
              cell: "text-center text-xs xl:text-sm p-0 relative w-6 h-6 xl:w-10 xl:h-10 flex items-center justify-center",
              day: "w-6 h-6 xl:w-8 xl:h-8 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "flex items-center justify-between",
              nav_button: "h-6 w-6 xl:h-8 xl:w-8 p-0 hover:opacity-50 flex items-center justify-center",
              nav_button_previous: "absolute left-0",
              nav_button_next: "absolute right-0",
            }}
          />
        </div>
      </div>
      <div className={`${isMobile ? 'w-full' : 'col-span-8'} bg-white rounded-lg border border-sidebar-border p-6 overflow-y-auto max-h-[calc(100vh-350px)]`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            Lịch Hẹn{" "}
            {date && `- ${formatDateFull(date)}`}
          </h3>
          <span className="text-sm text-muted-foreground">
            {appointments?.length || 0} lịch hẹn
          </span>
        </div>
        <div className="space-y-6">
          {appointments && appointments?.length > 0 ? (
            appointments?.map((appointment: any) => (
              <div
                key={appointment?.$id}
                className="flex gap-4 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors justify-between"
              >
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={appointment?.patients?.avatar || ""}
                    />
                    <AvatarFallback>
                      {appointment?.patients?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">
                      {appointment?.patients?.name || ""}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment?.services?.name || ""}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm px-2 py-0.5 bg-primary/10 text-black rounded">
                        {appointment?.appointment_time_range || ""} 
                      </span>
                      (<span className="text-sm text-black">
                        {appointment?.services?.duration || ""} phút
                      </span>)
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">{getStatusText(appointment?.status)}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Không có lịch hẹn nào trong ngày này
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
