"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Printer, Download, Trash } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import dayjs from "dayjs";
import { patientsService } from "@/api/patients";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateNextCode } from "@/utils/generate-code";
import { prescriptionService } from "@/api/prescription";
import { formatDateToDisplay } from "@/utils/date-utils";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { ID } from "appwrite";
import { inventoryService } from "@/api/inventory";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "next/navigation";

interface RecordPrescriptionsProps {
  record: any;
}

const medicationSchema = z.object({
  name: z.string().min(1, "Tên thuốc không được để trống"),
  dosage: z.string().min(1, "Liều lượng không được để trống"),
  frequency: z.string().min(1, "Tần suất không được để trống"),
  duration: z.string().min(1, "Thời gian không được để trống"),
  amount: z.string().min(1, "Số lượng không được để trống"),
});

const prescriptionFormSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày kê đơn",
  }),
  medications: z
    .array(medicationSchema)
    .min(1, "Phải có ít nhất một loại thuốc"),
  instructions: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export function RecordPrescriptions({ record }: RecordPrescriptionsProps) {
  const [showAddPrescriptionDialog, setShowAddPrescriptionDialog] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [popoverOpen, setPopoverOpen] = useState<{ [key: string]: boolean }>({});
  const [selectedMedicines, setSelectedMedicines] = useState<{ [key: string]: any }>({});
  const { id } = useParams();
  const queryClient = useQueryClient();

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      date: new Date(),
      medications: [{ name: "", dosage: "", frequency: "", duration: "", amount: "" }],
      instructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const useGetPatientPrescription = () => {
    return useQuery({
      queryKey: ["patient-prescription"],
      queryFn: () => prescriptionService.getPatientPrescription(),
    });
  }

  const useGetInventory = () => {
    return useQuery({
      queryKey: ["inventory", page, debouncedSearch],
      queryFn: async () => {
        setIsLoadingMore(true);
        try {
          const response = await inventoryService.fetchInventoryDocuments(
            {
              fieldId: "category",
              value: "medicine",
            },
            20,
            (page - 1) * 20,
            debouncedSearch || undefined
          );

          if (page === 1) {
            setAllMedicines(response?.data || []);
          } else {
            const newMedicines = (response?.data || []).filter(
              (newMedicine) =>
                !allMedicines.some(
                  (existingMedicine) => existingMedicine.$id === newMedicine.$id
                )
            );
            setAllMedicines((prev) =>
              page === 1
                ? newMedicines
                : [...prev, ...newMedicines.filter((nm: any) => !prev.some((m) => m.$id === nm.$id))]
            );
          }

          setHasMore((response?.data || []).length === 20);
          return response;
        } finally {
          setIsLoadingMore(false);
        }
      },
      staleTime: 3000,
    });
  };

  const fetchMoreMedicines = useCallback(() => {
    if (!isLoadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore]);

  const { data: prescriptions, isLoading: isPrescriptionsLoading } = useGetPatientPrescription();
  
  const { data: inventory_medicines } = useGetInventory();

  const handleSelectMedicine = (medicine: any, index: number) => {
    setSelectedMedicines(prev => ({
      ...prev,
      [index]: medicine
    }));
  }

  const calculateTotalPrice = () => {
    return Object.entries(selectedMedicines).reduce((total, [index, medicine]) => {
      const amount = parseInt(form.getValues(`medications.${Number(index)}.amount`) || '0');
      return total + (medicine?.price || 0) * amount;
    }, 0);
  }

  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsLoading(true);
    
    try {
      setIsSaving(true);
      const existingPrescription = prescriptions?.map((item: any) => item?.prescription_code)
      const prescriptionCode = generateNextCode({
        prefix: "PR",
        length: 3,
        existingCodes: existingPrescription || [],
      });
      
      const records = data?.medications?.map((med, index) =>
        JSON.stringify({
          medicine_name: med?.name,
          dosage: med?.dosage,
          frequency: med?.frequency,
          duration: med?.duration,
          amount: med?.amount,
          price: selectedMedicines[index]?.price || 0,
        })
      );

      const payload = {
        prescription_code: prescriptionCode,
        prescription_date: dayjs(data.date).format("YYYY-MM-DD"),
        instruction: data.instructions || "",
        patients: record?.patients?.$id,
        prescription_info: records,
        treatment: record?.$id,
        price: calculateTotalPrice(),
      };

      // Create prescription
      const response = await prescriptionService.createPatientPrescription(payload, ID.unique());

      // Update inventory quantities
      for (let i = 0; i < data.medications.length; i++) {
        const medicine = selectedMedicines[i];
        if (medicine) {
          const currentQuantity = medicine.amount || 0;
          const prescribedAmount = parseInt(data.medications[i].amount) || 0;
          const newQuantity = Math.max(0, currentQuantity - prescribedAmount);

          await inventoryService.updateInventoryDocuments(medicine.$id, {
            amount: newQuantity
          });
        }
      }

      await queryClient.refetchQueries({
        queryKey: ["treatment", id],
      });
      await queryClient.refetchQueries({
        queryKey: ["inventory"],
      });

      setShowAddPrescriptionDialog(false);
      form.reset();
      setSelectedMedicines({});
    } catch (error) {
      throw new Error("Error creating prescription");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setShowAddPrescriptionDialog(open);
    if (!open) {
      form.reset();
    }
  };

  console.log(inventory_medicines)

  const handleDeletePrescription = async (patient_prescription_id: string) => {
    try {
      setIsLoading(true);
      await prescriptionService.deletePatientPrescription(patient_prescription_id);
      await queryClient.refetchQueries({
        queryKey: ["treatment", id],
      });
    } catch (error) {
      throw new Error("Error deleting prescription");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isPrescriptionsLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Đơn Thuốc</h2>
        <Button onClick={() => setShowAddPrescriptionDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm đơn thuốc
        </Button>
      </div>

      <div className="space-y-4">
        {record?.prescriptions?.length > 0 ? (
          record?.prescriptions?.map(
            (prescription: any, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Đơn Thuốc #{prescription?.prescription_code}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDateToDisplay(
                        prescription?.fields?.prescription_date
                      )}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thuốc</TableHead>
                        <TableHead>Liều lượng</TableHead>
                        <TableHead>Tần suất</TableHead>
                        <TableHead>Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescription?.prescription_info?.map(
                        (medication: any, medIndex: number) => (
                          <TableRow key={medIndex}>
                            <TableCell>
                              {JSON.parse(medication)?.medicine_name}
                            </TableCell>
                            <TableCell>{JSON.parse(medication)?.dosage}</TableCell>
                            <TableCell>
                              {JSON.parse(medication)?.frequency}
                            </TableCell>
                            <TableCell>
                              {JSON.parse(medication)?.duration}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                  {prescription?.instruction && (
                    <div className="mt-4">
                      <h4 className="mb-1 text-sm font-medium">Hướng dẫn:</h4>
                      <p className="text-sm">
                        {prescription?.instruction}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    In
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Tải xuống
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeletePrescription(prescription?.$id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </CardFooter>
              </Card>
            )
          )
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-medium">Không có đơn thuốc</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Chưa có đơn thuốc nào được thêm vào hồ sơ này
              </p>
              <Button onClick={() => setShowAddPrescriptionDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm đơn thuốc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={showAddPrescriptionDialog}
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Thêm Đơn Thuốc Mới</DialogTitle>
            <DialogDescription>
              Thêm đơn thuốc mới vào hồ sơ bệnh án
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày kê đơn</FormLabel>
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
                          disabled={(date: any) => {
                            const today = dayjs().startOf('day');
                            const selectedDate = dayjs(date).startOf('day');
                            return selectedDate.isBefore(today);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Danh sách thuốc</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                        amount: "",
                      })
                    }
                    className="border-sidebar-border"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm thuốc
                  </Button>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 gap-4 rounded-md border p-4 border-sidebar-border"
                    >
                      <FormField
                        control={form.control}
                        name={`medications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên thuốc</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between outline-none text-muted-foreground border-sidebar-border hover:bg-white hover:text-muted-foreground"
                                  onClick={() => setPopoverOpen(prev => ({ ...prev, [index]: !prev[index] }))}
                                >
                                  {field.value
                                    ? allMedicines.find(
                                        (medicine) => medicine.name === field.value
                                      )?.name
                                    : "Chọn thuốc..."}
                                </Button>
                              </FormControl>
                              {popoverOpen[index] && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border z-[999]">
                                  <Command className="w-full">
                                    <CommandInput
                                      placeholder="Tìm kiếm thuốc..."
                                      value={searchQuery}
                                      className="w-full"
                                      onValueChange={setSearchQuery}
                                    />
                                    <CommandEmpty>
                                      Không tìm thấy thuốc.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      <div
                                        id={`scrollableDiv-${index}`}
                                        className="max-h-[300px] overflow-y-auto"
                                      >
                                        <InfiniteScroll
                                          dataLength={allMedicines.length}
                                          next={fetchMoreMedicines}
                                          hasMore={hasMore}
                                          loader={
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                              Đang tải thêm...
                                            </div>
                                          }
                                          scrollableTarget={`scrollableDiv-${index}`}
                                          endMessage={
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                              Không còn thuốc nào
                                            </div>
                                          }
                                        >
                                          {allMedicines.map((medicine) => (
                                            <CommandItem
                                              key={medicine.$id}
                                              value={medicine.$id}
                                              onSelect={() => {
                                                field.onChange(medicine.name);
                                                setPopoverOpen(prev => ({ ...prev, [index]: false }));
                                                handleSelectMedicine(medicine, index);
                                              }}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span>{medicine.name}</span>
                                              </div>
                                              <Check
                                                className={cn(
                                                  "ml-auto h-4 w-4",
                                                  field.value === medicine.name
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                        </InfiniteScroll>
                                      </div>
                                    </CommandGroup>
                                  </Command>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medications.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Liều lượng</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medications.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tần suất</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ví dụ: 3 lần/ngày"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medications.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời gian</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 7 ngày" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`medications.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số lượng</FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 10 viên" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {fields.length > 1 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Xóa thuốc
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hướng dẫn</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập hướng dẫn sử dụng thuốc"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddPrescriptionDialog(false);
                    form.reset();
                  }}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : "Lưu"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
