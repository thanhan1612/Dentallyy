import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  User,
  Phone,
  Home,
  Upload,
  UserCog,
  Building2,
  Briefcase,
  FileText,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/api/employee";
import { doctorService } from "@/api/doctors";
import { useEmployeeStore } from "@/store/employee-store";
import { authService } from "@/api/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useModal } from "@/contexts/modal-context";
import { uploadAttachment } from "@/api/attrachment";
import { getRole } from "@/table-setting/columns";
import { ROLES } from "@/constants/categories";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(),
  avatar: z.any().optional(),
  role: z.string().min(1, "Role is required"),
  branchId: z.string().min(1, "Branch is required"),
  specialty: z.string().optional(),
  description: z.string().optional(),
  workTitle: z.string().optional(),
  salary: z.string().min(0, "Salary must be greater than 0"),
});

interface Step2PersonalInfoProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onBack: () => void;
}

export default function Step2PersonalInfo({
  onSubmit,
  onBack,
}: Step2PersonalInfoProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.labels.includes("SADMIN");
  const isBranchAdmin = user?.labels.includes("BADMIN");
  const accountInfo = useEmployeeStore((state) => state.accountInfo);
  const setPendingEmployee = useEmployeeStore(
    (state) => state.setPendingEmployee
  );
  const setPersonalInfo = useEmployeeStore((state) => state.setPersonalInfo);
  const { closeModal, modalData } = useModal();

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => authService.fetchBranchDocuments(),
    //enabled: isSuperAdmin,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      gender: "",
      role: "",
      branchId: "",
      specialty: "",
      description: "",
      workTitle: "",
      salary: "",
    },
  });

  const saveEmployeeData = async (
    employeeId: string,
    values: z.infer<typeof formSchema>
  ) => {
    try {
      // Save employee data to store
      setPendingEmployee({
        ...values,
        id: employeeId,
        email: accountInfo?.email,
      });

      // Get data from store and save
      const pendingEmployee = useEmployeeStore.getState().pendingEmployee;
      if (pendingEmployee) {
        const personalInfoPayload = {
          id: pendingEmployee.id,
          name: pendingEmployee.firstName,
          lastName: pendingEmployee.lastName,
          branch: pendingEmployee.branchId,
          role: pendingEmployee.role,
          gender: pendingEmployee.gender,
          dob: pendingEmployee.dateOfBirth,
          staff_email: pendingEmployee.email,
          address: pendingEmployee.address || "",
          specialty: pendingEmployee.specialty || "",
          staff_description: pendingEmployee.description || "",
          staff_phone: pendingEmployee.phone || "",
          staff_code: modalData?.lastStaffCode || "",
          active: false,
          salary: Number(pendingEmployee.salary) || 0,
        };

        await doctorService.createDoctorDocuments(personalInfoPayload);
        useEmployeeStore.getState().clearPendingEmployee();

      }
    } catch (error) {
      throw error;
    }
  };

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!accountInfo?.email || !accountInfo?.password) {
        throw new Error('Account information is missing');
      }

      // First create employee account
      const accountPayload = {
        email: accountInfo.email,
        password: accountInfo.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
      };

      const accountResponse = await doctorService.createAccountDoctor(
        accountPayload.email,
        accountPayload.password,
        accountPayload.name
      );

      if (!accountResponse?.$id) {
        throw new Error('Failed to create account');
      }

      await saveEmployeeData(accountResponse.$id, values);
      onSubmit(values);

      if (modalData?.onSuccess) {
        modalData.onSuccess(true);
        closeModal();
      }
    } catch (error) {
      throw error;
    }
  }

  // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     form.setValue("avatar", file);
  //   }
  // };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
        >
          {/* <div className="flex justify-center mb-4 top-0 bg-background pt-2 pb-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    form.watch("avatar")
                      ? URL.createObjectURL(form.watch("avatar"))
                      : ""
                  }
                />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
              >
                <Upload className="h-4 w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div> */}

          <div className="bg-background gap-4 flex">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <div className="relative">
                        <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <SelectTrigger className="pl-9 w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {isSuperAdmin
                        ? ROLES.slice(1)?.map((role: any) => (
                            <SelectItem key={role?.id} value={role?.id}>
                              {getRole(role?.value)}
                            </SelectItem>
                          ))
                        : ROLES.slice(2)?.map((role: any) => (
                            <SelectItem key={role?.id} value={role?.id}>
                              {getRole(role?.value)}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Branch</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <SelectTrigger className="pl-9 w-full">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      {branches?.map((branch: any) => (
                        <SelectItem key={branch?.$id} value={branch?.$id}>
                          {branch?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your first name"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your last name"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            dayjs(field.value).format("DD/MM/YYYY")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialty</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your specialty"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Enter your description"
                        className="pl-9 min-h-[100px]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your phone number"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter your address"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter salary"
                        type="number"
                        min="0"
                        className="pl-4"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 items-center justify-center">
              <Button
                type="button"
                variant="outline"
                className="w-1/3"
                onClick={() => {
                  const values = form.getValues();
                  setPersonalInfo(values as any);
                  onBack();
                }}
              >
                Back
              </Button>
              <Button type="submit" className="w-1/3">
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập mật khẩu admin</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handlePasswordSubmit}
              disabled={isLoading || !password}
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </>
  );
}
