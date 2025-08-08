"use client";
import { PageContainer } from "@/components/PageContainer/page-container";
import { ModalType } from "@/types/modal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { employeeColumns } from "@/table-setting/columns";
import { DataTable } from "@/components/Table/table-data";
import ProtectedLayout from "@/app/(protected)/layout";
import { doctorService } from "@/api/doctors";
import { useCallback, useEffect, useState } from "react";
import { generateNextCode } from "@/utils/generate-code";
import { useModal } from "@/contexts/modal-context";

export default function StaffPage() {
  const { user } = useAuth();
  const { openModal } = useModal();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: employees,
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
  } = useQuery({
    queryKey: ["employees", page, limit, debouncedSearch],
    queryFn: () =>
      doctorService.getDoctorDocuments(
        undefined,
        limit,
        (page - 1) * limit,
        debouncedSearch
      ),
  });

  const handleAddStaff = useCallback(() => {
    const staffCodes = employees?.data?.map(
      (employee: any) => employee.staff_code
    );
    const lastStaffCode = generateNextCode({
      prefix: "NV",
      length: 3,
      existingCodes: staffCodes || [],
    });

    openModal(ModalType.STAFF, {
      lastStaffCode,
      onSuccess: async (shouldRefetch: boolean) => {
        if (shouldRefetch) {
          await refetchEmployees();
        }
      },
    });
  }, [employees?.data, openModal, refetchEmployees]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <ProtectedLayout>
      <PageContainer
        title="Quản lý nhân viên"
        actions={true}
        buttonName="Thêm nhân viên"
        modalType={ModalType.STAFF}
        onActionClick={handleAddStaff}
      >
        <div>
          <DataTable
            columns={employeeColumns}
            data={employees?.data || []}
            total={employees?.total || 0}
            limit={limit}
            page={page}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onSearchChange={setSearch}
            isLoading={isLoadingEmployees}
          />
        </div>
      </PageContainer>
    </ProtectedLayout>
  );
}
