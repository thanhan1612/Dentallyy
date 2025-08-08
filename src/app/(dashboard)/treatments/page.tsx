"use client"
import { treatmentService } from "@/api/treatment";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { PageContainer } from "@/components/PageContainer/page-container";
import { DataTable } from "@/components/Table/table-data";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/modal-context";
import { treatmentColumns } from "@/table-setting/columns";
import { ModalType } from "@/types/modal";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import ProtectedLayout from "@/app/(protected)/layout";
import { DashboardHeaderTreatment } from "@/components/Dashboard/dashboard-header-treatments";
import convertToMillionsThousands from "@/utils/convert-currency";

const TreatmentStatus = [
  {
    label: "Tất cả",
    value: "all"
  },
  {
    label: "Đã lên lịch",
    value: "schedule"
  },
  {
    label: "Đang thực hiện",
    value: "process"
  },
  {
    label: "Hoàn thành",
    value: "completed"
  },
]

const TreatmentFilterOptions = [
  {
    id: "name",
    label: "Tên bệnh nhân",
    value: "name",
  },
  {
    id: "treatment_name",
    label: "Tên điều trị",
    value: "treatment_name",
  },
  {
    id: "doctor_name",
    label: "Bác sĩ phụ trách",
    value: "doctor_name",
  },
  {
    id: "treatment_id",
    label: "Loại điều trị",
    value: "treatment_id",
  }
]

export default function TreatmentsPage() {
  const { openModal } = useModal();
  const { user } = useAuth();
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

  const useGetTreatments = () => {
    return useQuery({
      queryKey: ['treatment-documents', page, limit, debouncedSearch, status],
      queryFn: async () => {
        const isBranchAdmin = user?.[0]?.role === 'branch_admin' || user?.labels?.includes('BADMIN');
        const isDoctor = user?.[0]?.role === 'doctor' || user?.labels?.includes('DOCTOR');

        if (isBranchAdmin || isDoctor) {
          const response = await treatmentService.getTreatmentDocuments({
            fieldId: 'branch',
            value: user?.[0]?.branch?.$id
          }, limit, (page - 1) * limit, debouncedSearch, status);
          setTotal(response.total);
          return response;
        } else {
          const response = await treatmentService.getTreatmentDocuments(undefined, limit, (page - 1) * limit, debouncedSearch, status);
          setTotal(response.total);
          return response;
        }
      }
    });
  }

  const { data: treatmentsData, isLoading: isLoadingTreatments, refetch: refetchTreatments } = useGetTreatments();

  const isLoading =  isLoadingTreatments;
  const compareTotalTreatmentsBetweenMonth = (data: any) => {
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = data?.data?.filter(
      (item: any) => new Date(item.start_date).getMonth() === currentMonth
    );
    const previousMonthData = data?.data?.filter(
      (item: any) => new Date(item.start_date).getMonth() === previousMonth
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
      currentMonth : currentMonthData?.length,
      previousMonth: previousMonthData?.length,
      percentage: Math.round(percentage * 100) / 100,
    };
  };
  const getProcessTreatments = (data : any) => {
    const processTreatments = data?.data?.filter(treatment => 
      treatment?.status === "process"
    );
    const this_month  = new Date().getMonth();
    const this_year = new Date().getFullYear();
    const newTreatments = data?.data?.filter(treatment => {
      const startDate = new Date(treatment?.start_date);
      return startDate.getMonth() == this_month  && startDate.getFullYear() == this_year;
    })
    
    return {
      processTreatmentsLength :processTreatments?.length,
      newTreatmentPast30days: newTreatments?.length
    }
  };
  console.log(treatmentsData);
const getCompletedTreatments = (data:any) => {
    const completedTreatments = data?.data?.filter(treatment => 
      treatment?.status === 'completed'
    );
     const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const recentlyComplete = completedTreatments?.filter(treatment => {
      const completeDate = new Date(treatment.$updatedAt);
      return completeDate >= thirtyDaysAgo && completeDate <=today;
    });
    // compare new patients in this month to new patients the previous month
    
     const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(today.getDate() - 60);
    
      const previousMonthComplete = completedTreatments?.filter(treatment => {
      const completeDate = new Date(treatment.$updatedAt);
      return completeDate >= sixtyDaysAgo && completeDate < thirtyDaysAgo;
    });
      let percentage = 0;
    if (previousMonthComplete?.length>0) {
      percentage = (((recentlyComplete?.length || 0) - (previousMonthComplete?.length || 0)) / previousMonthComplete.length) * 100;

    } else if (recentlyComplete?.length>0) {
      percentage =100;
    }

    return {
      completedTreatmentslength : completedTreatments?.length,
      percentage : Math.round(percentage*100/100)
    }
  };
const getTotalRevenue = (data:any) =>{
  const completedTreatments = data?.data?.filter(treatment => treatment?.status === 'completed');
  const currentMonth = new Date().getMonth();
  const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = completedTreatments?.filter(
      (item: any) => new Date(item?.payment?.date).getMonth() === currentMonth
    );
    const previousMonthData = completedTreatments?.filter(
      (item: any) => new Date(item?.payment?.date).getMonth() === previousMonth
    );

    const getTotalAmount = (items: any[]) => {
      return items?.reduce((acc: number, item: any) => {
        if (!item?.payment?.paid) {
          return acc;
        }
       const totalPaidForItem = item.payment.paid.reduce((itemTotal: number, paidEntry: string) => {
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
      currentMonth: convertToMillionsThousands(currentMonthRevenue),
      previousMonth: convertToMillionsThousands(previousMonthRevenue),
      totalRevenue: convertToMillionsThousands(totalRevenue),
      percentage: Math.round(percentage * 100) / 100,
    };
  };


  const handleAddTreatment = useCallback(() => {
    openModal(ModalType.TREATMENT, 
      {
        onSuccess: async(shouldRefetch: boolean) => {
          if(shouldRefetch) {
            await refetchTreatments();
          }
        }
      }
    )
  },[refetchTreatments, openModal]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if(isLoading) {
    return <LoadingScreen />
  }
  const dashboardHeader = {
    totalTreatments: [compareTotalTreatmentsBetweenMonth(treatmentsData).percentage,compareTotalTreatmentsBetweenMonth(treatmentsData).currentMonth],
    processTreatments:[getProcessTreatments(treatmentsData).processTreatmentsLength,getProcessTreatments(treatmentsData).newTreatmentPast30days],
    doneTreatments: [getCompletedTreatments(treatmentsData).completedTreatmentslength,getCompletedTreatments(treatmentsData).percentage],
    revenue:[getTotalRevenue(treatmentsData).currentMonth,getTotalRevenue(treatmentsData).percentage]
  };
  return (
    <ProtectedLayout>
      <PageContainer
        title="Quản Lý Điều Trị"
        actions={true}
        buttonName="Tạo Điều Trị Mới"
        modalType={ModalType.TREATMENT}
        onActionClick={handleAddTreatment}
    >
      <div className = "flex flex-col gap-6">
              <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <DashboardHeaderTreatment data ={dashboardHeader}/>
              </div>
      </div>
     
      
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
          <DataTable
            columns={treatmentColumns}
            data={treatmentsData?.data ?? []}
            statusTabs={TreatmentStatus}
            filterOptions={TreatmentFilterOptions}
            page={page}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            defaultStatus={status}
            isLoading={isLoadingTreatments}
          />
        </div>
      </PageContainer>
    </ProtectedLayout>
  )
}
