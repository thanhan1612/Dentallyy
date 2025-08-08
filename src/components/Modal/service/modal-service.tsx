import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useModal } from "@/contexts/modal-context";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { serviceService } from "@/api/service";

export default function ModalService() {
  const queryClient = useQueryClient();
  const { closeModal, modalData } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!modalData?.data;
  const title = isEditMode ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới";
  const description = isEditMode
    ? "Cập nhật thông tin dịch vụ"
    : "Thêm dịch vụ mới";

  const form = useForm({
    defaultValues: {
      service_name: modalData?.data?.name || "",
      duration: modalData?.data?.duration || "",
      description: modalData?.data?.description || "",
      price: modalData?.data?.cost || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const payload = {
          name: data.service_name,
          duration: Number(data.duration),
          cost: Number(data.price),
          description: data.description,
        };
        await serviceService.updateServiceDocuments(modalData?.data?.$id, payload);
      } else {
        const payload = {
          name: data.service_name,
          duration: Number(data.duration),
          cost: Number(data.price),
          description: data.description,
        };

        await serviceService.createServiceDocuments(payload);
      }
      await queryClient.invalidateQueries({
        queryKey: ["services"],
      });
      closeModal();
    } catch (error) {
      throw new Error("Lỗi khi xử lý dịch vụ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên dịch vụ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên dịch vụ" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian thực hiện</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập thời gian (phút)" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá dịch vụ</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Nhập giá dịch vụ" 
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập mô tả chi tiết về dịch vụ"
                      className="resize-none min-h-[100px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant={"outline"}
              className="ml-2 border-sidebar-border"
              onClick={closeModal}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white border-sidebar-border"
              disabled={isLoading}
            >
              {isLoading
                ? "Đang lưu..."
                : modalData?.mode === "edit"
                ? "Cập nhật"
                : "Lưu"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
