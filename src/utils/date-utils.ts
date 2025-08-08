import dayjs from "dayjs";
import "dayjs/locale/vi";

// Format date to YYYY-MM-DD for database
export const formatDateToDB = (date: Date | string) => {
  return dayjs(date).format("YYYY-MM-DD");
};

// Format date to DD/MM/YYYY for display
export const formatDateToDisplay = (date: Date | string) => {
  return dayjs(date).format("DD/MM/YYYY");
};

// Format date to full format with day name
export const formatDateFull = (date: Date | string) => {
  return dayjs(date).locale("vi").format("dddd, DD/MM/YYYY");
};

// Check if a date is in the past
export const isPastDate = (date: Date | string) => {
  return dayjs(date).isBefore(dayjs(), "day");
};

// Check if a date is today
export const isToday = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), "day");
};

// Check if a time slot is in the past for today
export const isPastTimeSlot = (timeStr: string) => {
  if (!timeStr) return false;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = dayjs();
  const slotTime = dayjs().hour(hours).minute(minutes);
  return slotTime.isBefore(now);
}; 