'use client'
import { paymentService } from "@/api/payment";
import { PageContainer } from "@/components/PageContainer/page-container";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { paymentColumns } from "@/table-setting/columns";
import { DataTable } from "@/components/Table/table-data";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import ProtectedLayout from "@/app/(protected)/layout";
import { DashboardHeaderPayment } from "@/components/Dashboard/dashboard-header-payment";
import { useState, useEffect } from "react";
import convertToMillonsThousands from "@/utils/convert-currency";
import { formatMoneyShort } from "@/utils/money-short";
const paymentStatus = [
  {
    label: "Tất cả",
    value: "all"
  },
  {
    label: "Đã thanh toán ",
    value: "completed"
  },
  {
    label: "Còn nợ",
    value: "debt"
  }
]

export default function PaymentPage() {
  const { user } = useAuth();
  const isBranchAdmin = user?.[0]?.role === 'branch_admin' || user?.labels?.includes('BADMIN');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments", page, limit, debouncedSearch, status],
    queryFn: async () => {
      if (isBranchAdmin) {
        const response = await paymentService.getPaymentDocuments({
          fieldId: 'branch',
          value: user?.[0]?.branch?.$id
        }, limit, (page - 1) * limit, debouncedSearch, status);
        setTotal(response.total);
        return response;
      } else {
        const response = await paymentService.getPaymentDocuments(
          undefined,
          limit,
          (page - 1) * limit,
          debouncedSearch,
          status
        );
        setTotal(response.total);
        return response;
      }
    }
  });
  // get total payment documents but no filter


  

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (isLoadingPayments  ) {
    return <LoadingScreen />
  };  

  const getTotalRevenue = (data:any) =>{
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
        new Date().setMonth(currentMonth - 1)
      ).getMonth();
      const currentMonthData = data?.data?.filter(
        (item: any) => new Date(item?.$createdAt).getMonth() === currentMonth
      );
      const previousMonthData = data?.data?.filter(
        (item: any) => new Date(item?.$createdAt).getMonth() === previousMonth
      );

      const getTotalAmount = (items: any[]) => {
        return items?.reduce((acc: number, item: any) => {
          if (!item?.paid) {
            return acc;
          }
        const totalPaidForItem = item.paid.reduce((itemTotal: number, paidEntry: string) => {
          try {
            const parsedPaid = JSON.parse(paidEntry);
            const paidAmount = Number(parsedPaid.paid_amount || 0);
            return itemTotal + paidAmount;
          } catch (error) {
            console.error('Error parsing paid entry:', paidEntry);
            return itemTotal;
          }
        }, 0);
        
        return acc + totalPaidForItem;
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
        currentMonth: formatMoneyShort(currentMonthRevenue),
        previousMonth: formatMoneyShort(previousMonthRevenue),
        totalRevenue: formatMoneyShort(totalRevenue),
        percentage: Math.round(percentage * 100) / 100,
      };
    };
  const getTotalTransactions = (data: any) => {
    const paidPatients = data?.data?.filter(payment => payment?.status == "completed");
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
        new Date().setMonth(currentMonth - 1)
      ).getMonth();
      const currentMonthData = data?.data?.filter(
        (item: any) => new Date(item?.$createdAt).getMonth() === currentMonth
      );
      const previousMonthData = data?.data?.filter(
        (item: any) => new Date(item?.$createdAt).getMonth() === previousMonth
      );

      const getCompletedPayments = (data:any) => {
        const completedPayments = data?.filter(payment => payment?.status == 'completed');
        return completedPayments;
      }
      const currentMonthRevenue = getCompletedPayments(currentMonthData);
      const previousMonthRevenue = getCompletedPayments(previousMonthData);
      let percentage = 0;
      if (previousMonthRevenue?.length>0) {
        percentage = (((currentMonthRevenue?.length || 0) - (previousMonthRevenue?.length || 0)) / previousMonthRevenue.length) * 100;
      } else if (currentMonthRevenue?.length>0) {
        percentage =100;
   }

    return {
      num: paidPatients.length,
      percentage : Math.round(percentage *100)/100
    };
    }
  const getProcessTransactions = (data:any) => {
    const processTransactions = data?.data?.filter(payment =>
       payment?.status == "process");
    let totalProcessCost  = 0;
    for (let i= 0;i < processTransactions.length;i++) {
      totalProcessCost += processTransactions[i].cost || 0;
    };
    let inDebtAmount = 0;
    const inDebtTransactions = data?.data?.filter(payment => payment?.status == "debt");
    // funcion to get total paid amount of each record
    const getTotalPaidAmount = (paymentRecord:any) => {
      if (!paymentRecord.paid || paymentRecord.paid.length === 0) {
        return 0;
      }
      
      let totalPaid = 0;
      
      paymentRecord.paid.forEach(paidString => {
        try {
          const paidData = JSON.parse(paidString);
          totalPaid += paidData.paid_amount || 0;
        } catch (error) {
          console.error('Error parsing paid data:', error);
        }
      });
      
      return totalPaid;
  };
    for (let i= 0;i < inDebtTransactions.length;i++) {
      const totalCost = inDebtTransactions[i].cost || 0;
      const totalPaid = getTotalPaidAmount(inDebtTransactions[i]);
      const remainDebt = totalCost-totalPaid;
      if (remainDebt > 0) {
        inDebtAmount += remainDebt;
      }

    };
    return {
      num :processTransactions.length+inDebtTransactions.length,
      cost: convertToMillonsThousands(inDebtAmount+totalProcessCost)
    }
  }
  console.log(payments);
  console.log(Object.values(paymentStatus));
  const dashboardHeader = {
    totalRevenue: getTotalRevenue(payments),
    numTransactions: getTotalTransactions(payments),
    processTransactions:getProcessTransactions(payments),
    
  }

  return (
    <ProtectedLayout>
    <PageContainer title="Quản Lý Thanh Toán" actions={false}>
       <div className = "flex flex-col gap-6">
                    <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <DashboardHeaderPayment data ={dashboardHeader}/>
                    </div>
            </div>
            <div></div>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
        <DataTable
          columns={paymentColumns}
          data={payments?.data || []}
          statusTabs={paymentStatus}
          page={page}
          limit={limit}
          total={total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          defaultStatus={status}
          isLoading={isLoadingPayments}
        />
      </div>
    </PageContainer>
    </ProtectedLayout>
  );
}
