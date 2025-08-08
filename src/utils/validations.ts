import { z } from 'zod';

// Schema cơ bản cho các trường thông thường
export const commonSchemas = {
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc').min(10, 'Số điện thoại phải có ít nhất 10 ký tự').regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  name: z.string()
    .min(1, 'Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  required: z.string().min(1, 'Trường này là bắt buộc'),
  number: z.string().regex(/^[0-9]+$/, 'Vui lòng nhập số'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
};

// Schema cho form đăng nhập
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
});

// Schema cho form thông tin bệnh nhân
export const patientSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên bệnh nhân"),
  dob: z.date().optional(),
  gender: z.enum(["Nam", "Nữ", "Khác"]),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")).optional().nullable(),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  branchId: z.string().min(1, "Vui lòng chọn chi nhánh")
});

// Schema cho form lịch hẹn
export const appointmentSchema = z.object({
  patientType: z.enum(["existing", "new"]),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientEmail: z.string().optional(),
  date: z.date(),
  time: z.string(),
  serviceId: z.string(),
  doctorId: z.string(),
  branchId: z.string(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.patientType === "existing") {
    if (!data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientId"],
        message: "Vui lòng chọn bệnh nhân hiện có",
      });
    }
  } else {
    if (!data.patientName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientName"],
        message: "Vui lòng nhập tên bệnh nhân",
      });
    }
    if (!data.patientPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientPhone"],
        message: "Vui lòng nhập số điện thoại",
      });
    }
    if (!data.patientEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientEmail"],
        message: "Vui lòng nhập email",
      });
    }
  }
});

export const treatmentSchema = z.object({
  branchId: z.string().min(1, "Vui lòng chọn chi nhánh"),
  patientId: z.string().min(1, "Bệnh nhân là bắt buộc"),
  doctorId: z.string().min(1, "Bác sĩ là bắt buộc"),
  treatmentId: z.string().min(1, "Dịch vụ là bắt buộc"),
  treatmentName: z.string().min(1, "Tên điều trị là bắt buộc"),
  price: z.number().optional(),
  startDate: z.date({
    required_error: "Ngày khám là bắt buộc"
  }),
  status: z.enum(['schedule', 'process', 'completed', 'cancel'], {
    required_error: "Trạng thái là bắt buộc"
  }),
  treatment_description: z.string().optional(),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  promotion: z.number().min(0, "Khuyến mãi không được âm"),
});

export type TreatmentFormData = {
  branchId: string;
  patientId: string;
  doctorId: string;
  treatmentId: string;
  treatmentName: string;
  price?: number;
  startDate: Date;
  status: 'schedule' | 'process' | 'completed' | 'cancel';
  treatment_description?: string;
  quantity: number;
  promotion: number;
};

export const appointmentDialogSchema = z.object({
  serviceId: z.string().min(1, "Vui lòng chọn dịch vụ"),
  appointmentDate: z.date({
    required_error: "Vui lòng chọn ngày hẹn"
  }),
  doctorId: z.string().min(1, "Vui lòng chọn bác sĩ"),
  appointmentTime: z.string().min(1, "Vui lòng chọn giờ hẹn"),
  notes: z.string().optional(),
});

// Schema cho form thanh toán
export const paymentSchema = z.object({
  paid: z.number()
    .min(0, "Số tiền thanh toán phải lớn hơn 0"),
  payment_date: z.date({
    required_error: "Vui lòng chọn ngày thanh toán",
  }),
  notes: z.string().optional(),
});

// Type inference cho các schema
export type LoginFormData = z.infer<typeof loginSchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>; 
export type AppointmentDialogFormData = z.infer<typeof appointmentDialogSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>; 