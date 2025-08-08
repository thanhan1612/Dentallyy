"use client";

import { PageContainer } from "@/components/PageContainer/page-container";
import { StatCard } from "@/components/StatCard/stat-card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User } from "lucide-react";
import { DashboardHeader } from "@/components/Dashboard/dashboard-header";
import { useQuery } from "@tanstack/react-query";
import { patientsService } from "@/api/patients";
import { appointmentService } from "@/api/appointment";
import { paymentService } from "@/api/payment";
import { inventoryService } from "@/api/inventory";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { DashboardChart } from "@/components/Dashboard/dashboard-chart";
import { DashboardAiInsights } from "@/components/Dashboard/dashboard-ai-analyze";
import { DashboardRecentAppointment } from "@/components/Dashboard/dashboard-recent-appointment";
import ProtectedLayout from "../(protected)/layout";
import { getRoleFromLabels } from "@/utils/role-from-label";
import { formatMoneyShort } from "@/utils/money-short";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const userRole = user?.labels
    ? getRoleFromLabels(user.labels)
    : user?.[0]?.role;
  const isBranchAdmin = userRole === "branch_admin";
  console.log('User object:', user);
  console.log('User role:', userRole);

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      if (isBranchAdmin) {
        return await patientsService.getPatientDocuments({
          fieldId: "branch",
          value: user?.[0]?.branch?.$id,
        });
      }
      return await patientsService.getPatientDocuments();
    },
    enabled: !!user,
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (isBranchAdmin) {
        return await appointmentService.fetchAppointmentDocuments({
          fieldId: "branch",
          value: user?.[0]?.branch?.$id,
        });
      }
      return await appointmentService.fetchAppointmentDocuments();
    },
    enabled: !!user,
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      if (isBranchAdmin) {
        return await paymentService.getPaymentDocuments({
          fieldId: "branch",
          value: user?.[0]?.branch?.$id,
        });
      }
      return await paymentService.getPaymentDocuments();
    },
    enabled: !!user,
  });

  const { data: inventory, isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      if (isBranchAdmin) {
        return await inventoryService.fetchInventoryDocuments({
          fieldId: "branch",
          value: user?.[0]?.branch?.$id,
        });
      }
      return await inventoryService.fetchInventoryDocuments();
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    if (!user) return;
    
    if (userRole === 'doctor') {
      router.push("/patients");
    } else if (userRole === "staff") {
      router.push("/settings");
    }
  }, [user, router, userRole]);

 
  

  if (userRole === "doctor" || userRole === "staff") {
    return <LoadingScreen />;
  }

  const filter =
    user?.branchId && user?.role !== "SUPER_ADMIN"
      ? encodeURIComponent(
          JSON.stringify({
            conjunction: "and",
            filterSet: [
              { fieldId: "branch", operator: "is", value: user?.branchId },
            ],
          })
        )
      : undefined;
    
 

  const mappedData = {
    patients: patients,
    appointments: appointments,
    payments: payments,
    inventory: inventory,
  };

  const compareTotalPatientsBetweenMonth = (data: any) => {
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = data?.data?.filter(
      (item: any) => new Date(item.$createdAt).getMonth() === currentMonth
    );
    const previousMonthData = data?.data?.filter(
      (item: any) => new Date(item.$createdAt).getMonth() === previousMonth
    );

    let percentage = 0;
    if (previousMonthData?.length > 0) {
      percentage =
        ((currentMonthData?.length - previousMonthData?.length) /
          previousMonthData?.length) *
        100;
    } else if (currentMonthData?.length > 0) {
      percentage = 100;
    }

    return {
      currentMonth: currentMonthData?.length,
      previousMonth: previousMonthData?.length,
      percentage: Math.round(percentage * 100) / 100,
    };
  };

  const todayTotalAppointments = mappedData.appointments?.data?.filter(
    (item: any) =>
      new Date(item.$createdAt).toLocaleDateString() ===
      new Date().toLocaleDateString()
  );
 

  const calculateTotalRevenueBetweenMonth = (data: any) => {
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = data?.data?.filter(
      (item: any) => new Date(item.$createdAt).getMonth() === currentMonth
    );
    const previousMonthData = data?.data?.filter(
      (item: any) => new Date(item.$createdAt).getMonth() === previousMonth
    );

    const getTotalAmount = (items: any[]) => {
      return items?.reduce((acc: number, item: any) => {
        const paidArray = item?.paid || [];
        const paidAmount = paidArray?.reduce(
          (sum: number, payment: any) => sum + Number(payment?.title || 0),
          0
        );
        return acc + paidAmount;
      }, 0);
    };

    const currentMonthRevenue = getTotalAmount(currentMonthData);
    const previousMonthRevenue = getTotalAmount(previousMonthData);

    let totalRevenue = 0;
    let percentage = 0;
    if (previousMonthData?.length > 0) {
      totalRevenue = currentMonthRevenue - previousMonthRevenue;
      percentage =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100;
    } else if (currentMonthData?.length > 0) {
      totalRevenue = currentMonthRevenue;
      percentage = 100;
    }

    return {
      currentMonth: currentMonthRevenue,
      previousMonth: previousMonthRevenue,
      totalRevenue: totalRevenue,
      percentage: Math.round(percentage * 100) / 100,
    };
  };
  console.log(inventory)
  const findingRunningOutInventory = (data: any) => {
    const now = new Date();
    let lowStock = 0;
    let expired = 0;

    data?.data?.forEach((item: any) => {
      const amount = Number(item?.total || 0);
      const unit = (item?.unit || "").toLowerCase();
      const expiration = item?.expiration_date
        ? new Date(item?.expiration_date)
        : null;

      const isLowStock =
        (["chiếc", "ống", "cái"].includes(unit) && amount < 10) ||
        (unit === "viên" && amount < 100);
      const isExpired = expiration && expiration < now;

      if (isLowStock) lowStock++;
      if (isExpired) expired++;
    });

    return { lowStock, expired };
  };
 

  const dashboardHeader = {
    patients: compareTotalPatientsBetweenMonth(mappedData.patients),
    appointments: todayTotalAppointments,
    inventory: findingRunningOutInventory(mappedData.inventory),
    totalRevenue: calculateTotalRevenueBetweenMonth(mappedData.payments),
  };

  if (
    isLoadingPatients ||
    isLoadingAppointments ||
    isLoadingPayments ||
    isLoadingInventory
  ) {
    return <LoadingScreen />;
  }

  console.log(mappedData.payments)

  return (
    <ProtectedLayout>
      <PageContainer title="Tổng Quan" actions={false}>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardHeader data={dashboardHeader} />
        </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Tổng Quan Hoạt Động</h2>
          <DashboardChart
            patients={[]}
            payments={[]}
          />
          <div className="flex flex-col p-6 border-sidebar-border rounded-lg border">
            <h1 className="font-bold mb-2 text-xl">Phân Tích AI</h1>
            <p className="text-sm text-gray-500 mb-4">Phân tích và dự đoán xu hướng dựa trên dữ liệu phòng khám</p>
            <DashboardAiInsights />
          </div>
        </div>
      </PageContainer>
    </ProtectedLayout>
  );
}
