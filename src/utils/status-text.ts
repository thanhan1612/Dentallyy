export const getStatusText = (status: string) => {
  switch (status) {
    case "schedule":
      return "Đã đặt lịch";
    case "cancel":
      return "Hủy";
    case "process":
      return "Đang thực hiện";
    case "completed":
      return "Hoàn thành";
    case "confirm":
      return "Đã xác nhận";
    case "waiting":
      return "Chờ xác nhận";
    default:
      return status;
  }
};

