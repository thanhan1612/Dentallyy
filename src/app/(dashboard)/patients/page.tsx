"use client";

import { patientsService } from "@/api/patients";
import { PageContainer } from "@/components/PageContainer/page-container";
import { DataTable } from "@/components/Table/table-data";
import { ModalType } from "@/types/modal";
import { useEffect, useState, useCallback } from "react";
import { patientColumns } from "@/table-setting/columns";
import { useModal } from "@/contexts/modal-context";
import { usePatientTableActions } from "@/table-setting/action-patient-table";
import { TableActions } from "@/components/Table/table-actions";
import { Row } from "@tanstack/react-table";
import { generateNextCode } from "@/utils/generate-code";
import { formatDateToDisplay } from "@/utils/date-utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { useQuery } from "@tanstack/react-query";
import ProtectedLayout from "@/app/(protected)/layout";
import { DashboardHeaderPatient } from "@/components/Dashboard/dashboard-header-patients";
import { compareTotalPatientsBetweenMonth } from "@/utils/compare-total-patients";
import { treatmentService } from "@/api/treatment";

const patientStatusTabs = [
  { label: "Tất cả", value: "all" },
  { label: "Đang điều trị", value: "process" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Mới", value: "new" },
];

const patientFilterOptions = [
  {
    id: "name",
    label: "Tên bệnh nhân",
    value: "name",
  },
  {
    id: "phone",
    label: "Số điện thoại",
    value: "phone",
  },
  {
    id: "email",
    label: "Email",
    value: "email",
  },
  {
    id: "code",
    label: "Mã BN",
    value: "code",
  },
];

export default function PatientsPage() {
  const { openModal } = useModal();
  const { user } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const usePatientDocuments = () => {
    return useQuery({
      queryKey: ["patient-documents", page, limit, status, debouncedSearch],
      queryFn: async () => {
        const isBranchAdmin =
          user?.[0]?.role === "branch_admin" ||
          user?.labels?.includes("BADMIN");
        const isDoctor =
          user?.[0]?.role === "doctor" || user?.labels?.includes("DOCTOR");

        if (isBranchAdmin || isDoctor) {
          const response = await patientsService.getPatientDocuments(
            {
              fieldId: "branch",
              value: user?.[0]?.branch?.$id,
            },
            limit,
            (page - 1) * limit,
            debouncedSearch,
            status === "all" ? undefined : status,              
          );
          setTotal(response.total);
          return response;
        } else {
          const response = await patientsService.getPatientDocuments(
            undefined,
            limit,
            (page - 1) * limit,
            debouncedSearch,
            status === "all" ? undefined : status,
                
          );
          setTotal(response.total);
          return response;
        }
      },
    });
  };
  
  const useTreatmentDocuments = () => {
    return useQuery({
      queryKey:['treatment-documents'],
      queryFn : async () => {
        return await treatmentService.getTreatmentDocuments();
      }
    })
  }  


  const { data: patientDocuments, isLoading: isLoadingPatientDocuments , refetch: refetchPatientDocuments } = usePatientDocuments();
  const { data: treatmentDocuments, isLoading: isLoadingTreatmentDocuments, refetch: refetchTreatmentDocuments} = useTreatmentDocuments();
  const getPatientAppointments = useCallback(
    (patientId: string) => {
      const patientAppointments = patientDocuments?.data?.find(
        (patient: any) => patient?.$id === patientId
      )?.appointments;
      const now = new Date();
      const pastAppointments =
        patientAppointments &&
        patientAppointments?.filter(
          (appointment: any) => new Date(appointment?.appointment_date) < now
        );
      const futureAppointments =
        patientAppointments &&
        patientAppointments?.filter(
          (appointment: any) => new Date(appointment?.appointment_date) >= now
        );

      return {
        lastVisit: pastAppointments[0],
        nextAppointment: futureAppointments[0],
      };
    },
    [patientDocuments]
  );

   
 
   const getNewPatients = (data: any) => {
    const inTreatments = data?.data?.filter(
      treatment => treatment?.status === "process"
    );
    const newTreatments = data?.data?.filter(
      treatment => treatment?.status === "schedule"
    );

    return {
      inTreatmentsNum: inTreatments?.length,
      newTreatmentsNum: newTreatments?.length
    };
  };
  const doneTreatments =
     patientDocuments?.data?.filter(patient => 
      patient?.treatment_status === "completed");
  console.log(doneTreatments);
  console.log(patientDocuments)
  const getDoneTreatmentsPast30days = (data:any) => {
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const recentlyComplete = data?.filter(treatment => {
      const completeDate = new Date(treatment?.$updatedAt);
      return completeDate >= thirtyDaysAgo && completeDate <=today;
    })
    return {
      numTreatmentPast30days : recentlyComplete?.length

    }

  }
  const getPatientsNew = (data: any) => {
    // get new patients in the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const recentlyComplete = data?.data?.filter(patient => {
      const completeDate = new Date(patient.createDate);
      return completeDate >= thirtyDaysAgo && completeDate <=today;
    });
    // compare new patients in this month to new patients the previous month
    
     const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
  
    const previousMonthComplete = data?.data?.filter(patient => {
    const completeDate = new Date(patient.createDate);
    return completeDate >= sixtyDaysAgo && completeDate < thirtyDaysAgo;
  });
    let percentage = 0;
   if (previousMonthComplete?.length>0) {
    percentage = (((recentlyComplete?.length || 0) - (previousMonthComplete?.length || 0)) / previousMonthComplete.length) * 100;
   } else if (recentlyComplete?.length>0) {
    percentage =100;
   }
    return {
      numPatientsPast30days : recentlyComplete?.length,
      numPatientsPrevious30days: previousMonthComplete?.length || 0,
      percentage : Math.round(percentage *100)/100

    }
};
console.log(patientDocuments)

 
 
  const handleViewPatient = useCallback(
    (patient: any) => {
      const { lastVisit, nextAppointment } = getPatientAppointments(
        patient?.$id
      );
      openModal(ModalType.PATIENT_INFORMATION, {
        ...patient,
        lastVisit,
        nextAppointment,
      });
    },
    [openModal, getPatientAppointments]
  );

  const handleAddPatient = useCallback(() => {
    const patientCodes = patientDocuments?.data?.map(
      (patient: any) => patient.patient_code
    );
    const lastPatientCode = generateNextCode({
      prefix: "P",
      length: 3,
      existingCodes: patientCodes || [],
    });

    openModal(ModalType.PATIENT, {
      lastPatientCode,
      onSuccess: async (shouldRefetch: boolean) => {
        if (shouldRefetch) {
          await refetchPatientDocuments();
        }
      },
    });
  }, [patientDocuments, openModal, refetchPatientDocuments]);

  const columns = patientColumns.map((column: any) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: { row: Row<any> }) => {
          const { actions, isDeleting } =
            usePatientTableActions(handleViewPatient);
          return (
            <>
              {isDeleting && <LoadingScreen />}
              <TableActions data={row.original} actions={actions} />
            </>
          );
        },
      };
    }
    if (
      column?.accessorKey === "lastVisit" ||
      column?.accessorKey === "nextAppointment"
    ) {
      return {
        ...column,
        cell: ({ row }: { row: Row<any> }) => {
          const { lastVisit, nextAppointment } = getPatientAppointments(
            row?.original?.$id
          );
          const sorted = [...row?.original?.treatment].sort((a, b) => {
            const dateA = new Date(a?.start_date);
            const dateB = new Date(b?.start_date);
            return dateB.getTime() - dateA.getTime();
          });

          const treatmentStartDate = sorted[0]?.start_date;

          if (column?.accessorKey === "lastVisit") {
            return !lastVisit && treatmentStartDate
              ? formatDateToDisplay(treatmentStartDate)
              : lastVisit
              ? formatDateToDisplay(lastVisit?.appointment_date)
              : "Chưa có";
          } else {
            return nextAppointment
              ? formatDateToDisplay(nextAppointment?.appointment_date)
              : "Chưa có";
          }
        },
      };
    }

    if (!column.cell) {
      return {
        ...column,
        cell: ({ row }: { row: Row<any> }) => {
          const value = row.getValue(column.accessorKey) as string;
          return (
            <div
              className="cursor-pointer hover:text-primary"
              onClick={() => router.push(`/patients/${row.original.id}`)}
            >
              {value}
            </div>
          );
        },
      };
    }

    return column;
  });
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

   if (isLoadingPatientDocuments || isLoadingTreatmentDocuments) {
    return <LoadingScreen />;
  }
    const dashboardHeader = {
    // patients: [patientsData?.records,compareTotalPatientsBetweenMonth(patientsData?.records)],
    // newpatients: getPatientsNew(patientsData),
    // intreatmentpatients: getNewPatients(treatmentsData),
    // donepatients: getDoneTreatmentsPast30days(doneTreatments)
    patients: [compareTotalPatientsBetweenMonth(patientDocuments).currentMonth,compareTotalPatientsBetweenMonth(patientDocuments)],
    newpatients : getPatientsNew(patientDocuments),
    intreatmentpatients:getNewPatients(treatmentDocuments),
    donepatients: getDoneTreatmentsPast30days(doneTreatments)
  };
 

  console.log(patientDocuments);

  return (
    <ProtectedLayout>
      <PageContainer
        title="Quản Lý Bệnh Nhân"
        actions={true}
        buttonName="Thêm Bệnh Nhân"
        modalType={ModalType.PATIENT}
        onActionClick={handleAddPatient}
      >
         <div className = "flex flex-col gap-6">
                      <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <DashboardHeaderPatient data ={dashboardHeader}/>
                      </div>
              </div>
              <div>
        <div>
          
          <DataTable
            columns={columns}
            data={patientDocuments?.data || []}
            statusTabs={patientStatusTabs}
            filterOptions={patientFilterOptions}
            page={page}
            total={total}
            onPageChange={handlePageChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            defaultStatus={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            isLoading={isLoadingPatientDocuments}
          />
        </div>
      </div>

      <div>
      
      </div>
    </PageContainer>
    </ProtectedLayout>
  );
}
