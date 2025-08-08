"use client";

import { serviceService } from "@/api/service";
import ProtectedLayout from "@/app/(protected)/layout";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import { PageContainer } from "@/components/PageContainer/page-container";
import { DataTable } from "@/components/Table/table-data";
import { serviceColumns } from "@/table-setting/columns";
import { ModalType } from "@/types/modal";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function ServicesPage() {
  const { user } = useAuth();
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

  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ["services", page, limit, debouncedSearch],
    queryFn: async () => {
      const isBranchAdmin =
        user?.[0]?.role === "branch_admin" || user?.labels?.includes("BADMIN");
      if (isBranchAdmin) {
        return await serviceService.getServiceDocuments(
          {
            fieldId: "branch",
            value: user?.[0]?.branch?.$id || user?.branchId,
          },
          limit,
          (page - 1) * limit,
          debouncedSearch
        );
      } else {
        return await serviceService.getServiceDocuments(
          undefined,
          limit,
          (page - 1) * limit,
          debouncedSearch
        );
      }
    },
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <ProtectedLayout>
      <div>
        <PageContainer
          title="Dịch Vụ"
          actions={true}
          buttonName="Thêm Dịch Vụ"
          modalType={ModalType.SERVICE}
        >
            <div>
              <DataTable
                columns={serviceColumns}
                data={services?.data || []}
                placeholderSearch="Tìm kiếm dịch vụ ..."
                total={services?.total || 0}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearchChange={setSearch}
                isLoading={isLoadingServices}
              />
            </div>
        </PageContainer>
      </div>
    </ProtectedLayout>
  );
}
