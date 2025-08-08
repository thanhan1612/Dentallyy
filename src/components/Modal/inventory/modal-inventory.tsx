import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useForm } from "react-hook-form";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { INVENTORY_CATEGORIES } from "@/constants/categories";
import { inventoryService } from "@/api/inventory";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDateToDisplay } from "@/utils/date-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/modal-context";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function ModalInventory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { closeModal, modalData } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!modalData?.data;
  const title = isEditMode ? "Chỉnh sửa vật tư" : "Thêm vật tư mới";
  const description = isEditMode
    ? "Cập nhật thông tin vật tư trong kho"
    : "Thêm vật tư mới vào kho";

  const form = useForm({
    defaultValues: {
      name: modalData?.data?.name || "",
      sku: modalData?.data?.sku_code || "",
      category: modalData?.data?.category || "",
      provider: modalData?.data?.provider || "",
      quantity: modalData?.data?.amount || "",
      unit: modalData?.data?.unit || "",
      price: modalData?.data?.price || "",
      description: modalData?.data?.description || "",
      expirationDate: modalData?.data?.expiration_date || undefined,
      status: modalData?.data?.status || "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const payload = {
          name: data?.name,
          sku_code: data?.sku,
          category: data?.category,
          provider: data?.provider,
          amount: Number(data?.quantity),
          unit: data?.unit,
          price: Number(data?.price),
          description: data?.description,
          expiration_date: data?.expirationDate,
          status: data?.status,
        };
        await inventoryService.updateInventoryDocuments(
          modalData?.data?.$id,
          payload
        );
      } else {
        const payload = {
          name: data.name,
          sku_code: data.sku,
          category: data.category,
          provider: data.provider,
          amount: Number(data.quantity),
          unit: data.unit,
          price: Number(data.price),
          description: data.description,
          expiration_date: data.expirationDate,
          status: "sufficient",
        };
        await inventoryService.createInventoryDocuments(payload);
      }
      await queryClient.invalidateQueries({
        queryKey: ["inventory"],
      });
      closeModal();
    } catch (error) {
      throw new Error("Lỗi khi tạo vật tư");
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vật tư</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên vật tư" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVENTORY_CATEGORIES?.slice(1)?.map((category) => (
                          <SelectItem
                            key={category?.value}
                            value={category?.value}
                          >
                            {category?.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập mã SKU" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhà cung cấp</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên nhà cung cấp" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-4 mt-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập số lượng"
                      value={field.value || ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập đơn vị" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập giá"
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
              name="expirationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày hết hạn</FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-sidebar-border",
                            !field.value && "text-muted-foreground"
                          )}
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
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Để trống nếu vật tư không có hạn sử dụng
                  </FormDescription>
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
                      placeholder="Nhập mô tả chi tiết về vật tư"
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
