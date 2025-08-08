'use client'

import { PageContainer } from "@/components/PageContainer/page-container";
import { DataTable } from "@/components/Table/table-data";
import { inventoryColumns } from "@/table-setting/columns";
import { inventoryService } from "@/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { INVENTORY_CATEGORIES } from "@/constants/categories";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
import ProtectedLayout from "@/app/(protected)/layout";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search, 500);

  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory", page, limit, debouncedSearch, status],
    queryFn: () => inventoryService.fetchInventoryDocuments(undefined, limit, (page - 1) * limit, debouncedSearch, status),
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <ProtectedLayout>
    <PageContainer title="Quản Lý Kho Vật Tư" actions={false}>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
        <DataTable
          columns={inventoryColumns}
          data={inventoryData?.data || []}
          filterType="custom"
          filterOptions={INVENTORY_CATEGORIES}
          placeholderSearch="Tìm kiếm vật tư ..."
          total={inventoryData?.total || 0}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onSearchChange={setSearch}
          isLoading={isLoadingInventory}
          onStatusChange={setStatus}
        />
      </div>
    </PageContainer>
    </ProtectedLayout>
  );
}
