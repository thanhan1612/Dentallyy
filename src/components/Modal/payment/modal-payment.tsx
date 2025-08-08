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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { paymentSchema, PaymentFormData } from "@/utils/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { formatDateToDisplay, isPastDate } from "@/utils/date-utils";
import { useModal } from "@/contexts/modal-context";
import { useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/api/payment";
import { useState } from "react";
import dayjs from "dayjs";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function ModalPayment() {
  const { modalData, closeModal } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paid: 0,
      payment_date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      
      const newPayment = {
        paid_amount: data.paid,
        notes: data.notes,
        date: dayjs(data.payment_date).format("YYYY-MM-DD")
      };

      const currentPaid = Array.isArray(modalData?.paid) ? modalData.paid : [];
      const updateData = {
        paid: [...currentPaid, JSON.stringify(newPayment)],
        status: data?.paid === modalData?.cost ? "completed" : "debt"
      };

      await paymentService.updatePaymentDocument(modalData?.id, updateData);
      queryClient.refetchQueries({ queryKey: ["payments"] });
      
      closeModal();
      if (modalData?.onSuccess) {
        modalData.onSuccess();
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="flex flex-col gap-2">
      <DialogTitle>Ghi nhận thanh toán</DialogTitle>
      <DialogDescription>Nhập thông tin thanh toán. Nhấn lưu khi hoàn tất.</DialogDescription>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="paid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền thanh toán (VNĐ)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  placeholder="Nhập số tiền thanh toán"
                />
              </FormControl>
              <FormDescription>
                Số tiền còn lại: {(modalData?.cost - (field.value || 0)).toLocaleString('vi-VN')} VNĐ
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Ngày thanh toán</FormLabel>
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
                      disabled={false}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Nhập ghi chú (không bắt buộc)"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
          >
            Hủy
          </Button>
          <Button 
            type="submit"
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
