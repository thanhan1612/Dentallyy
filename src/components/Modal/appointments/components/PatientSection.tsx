import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { AppointmentFormData } from "@/types/appointment";

interface PatientSectionProps {
  form: ReturnType<typeof useForm<AppointmentFormData>>;
  allPatients: any[];
  hasMore: boolean;
  isLoadingMore: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchMorePatients: () => void;
  selectedPatient: any;
  setSelectedPatient: (patient: any) => void;
  popoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
}

export function PatientSection({
  form,
  allPatients,
  hasMore,
  isLoadingMore,
  searchQuery,
  setSearchQuery,
  fetchMorePatients,
  selectedPatient,
  setSelectedPatient,
  popoverOpen,
  setPopoverOpen,
}: PatientSectionProps) {
  const patientType = form.watch("patientType");

  // Reset form fields when switching tabs
  useEffect(() => {
    if (patientType === "existing") {
      form.reset({
        ...form.getValues(),
        patientName: "",
        patientPhone: "",
        patientEmail: "",
      });
    } else {
      form.reset({
        ...form.getValues(),
        patientId: "",
      });
      setSelectedPatient(null);
    }
  }, [patientType, form, setSelectedPatient]);

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Thông Tin Bệnh Nhân</h3>

      <Tabs
        defaultValue="existing"
        value={patientType}
        onValueChange={(value) => {
          form.setValue("patientType", value as "existing" | "new");
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Bệnh nhân hiện có</TabsTrigger>
          <TabsTrigger value="new">Bệnh nhân mới</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="pt-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="w-full">Chọn Bệnh Nhân</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      onClick={() => setPopoverOpen(!popoverOpen)}
                    >
                      {field.value
                        ? allPatients.find(
                            (patient) => patient.$id === field.value
                          )?.name
                        : "Chọn bệnh nhân..."}
                    </Button>
                  </FormControl>
                  {popoverOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border z-[999]">
                      <Command className="w-full">
                        <CommandInput
                          placeholder="Tìm kiếm bệnh nhân..."
                          value={searchQuery}
                          className="w-full"
                          onValueChange={setSearchQuery}
                        />
                        <CommandEmpty>
                          Không tìm thấy bệnh nhân.
                        </CommandEmpty>
                        <CommandGroup>
                          <div
                            id="scrollableDiv"
                            className="max-h-[300px] overflow-y-auto"
                          >
                            <InfiniteScroll
                              dataLength={allPatients.length}
                              next={fetchMorePatients}
                              hasMore={hasMore}
                              loader={
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  Đang tải thêm...
                                </div>
                              }
                              scrollableTarget="scrollableDiv"
                              endMessage={
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  Không còn bệnh nhân nào
                                </div>
                              }
                            >
                              {allPatients.map((patient) => (
                                <CommandItem
                                  key={patient.$id}
                                  value={patient.$id}
                                  onSelect={() => {
                                    field.onChange(patient.$id);
                                    setSelectedPatient(patient);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={patient?.avatar || ""}
                                        alt={patient?.name}
                                      />
                                      <AvatarFallback>
                                        {patient?.name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{patient?.name}</span>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === patient.$id
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

          {selectedPatient && (
            <div className="mt-4 rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage
                    src={selectedPatient?.avatar || ""}
                    alt={selectedPatient?.name}
                  />
                  <AvatarFallback>
                    {selectedPatient?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-medium">{selectedPatient?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient?.phone || "Không có số điện thoại"} |{" "}
                    {selectedPatient?.email || "Không có email"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="patientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Bệnh Nhân</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên bệnh nhân" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="patientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Điện Thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 