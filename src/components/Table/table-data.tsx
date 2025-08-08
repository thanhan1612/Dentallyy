"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableColumnHeader } from "./table-column-header";
import { DataTablePagination } from "./table-pagination";
import { TableBarFilter, FilterOption, StatusTab } from "./table-bar-filter";
import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { ModalType } from "@/types/modal";
import { useModal } from "@/contexts/modal-context";
import { Category } from "@/constants/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterOptions?: FilterOption[];
  statusTabs?: StatusTab[];
  defaultStatus?: string;
  onStatusChange?: (status: string) => void;
  placeholderSearch?: string;
  filterType?: "default" | "custom" | "none";
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  page?: number;
  limit?: number;
  total?: number;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
}

interface ColumnMeta {
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterOptions = [],
  statusTabs = [],
  defaultStatus = "all",
  onStatusChange,
  placeholderSearch = "Tìm kiếm bệnh nhân...",
  filterType = "default",
  onPageChange,
  onLimitChange,
  page,
  limit,
  total,
  onSearchChange,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [status, setStatus] = useState(defaultStatus);
  const { openModal } = useModal();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setColumnFilters((prev) => prev.filter((filter) => filter.id !== "status"));

    if (newStatus !== "all") {
      setColumnFilters((prev) => [...prev, { id: "status", value: newStatus }]);
    }
  };

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      {filterType === "custom" ? (
        <div className="flex justify-between items-center">
          <TableBarFilter
            filterOptions={filterOptions as Category[]}
            statusTabs={statusTabs}
            defaultStatus={defaultStatus}
            onStatusChange={handleStatusChange}
            onSearchChange={handleSearchChange}
            onFilterChange={(filters) => {
              setColumnFilters(
                Object.entries(filters).map(([id, value]) => ({
                  id,
                  value,
                }))
              );
            }}
            placeholder={placeholderSearch}
            type={filterType}
          />
          <Button
            size="icon"
            className="w-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={() => openModal(ModalType.INVENTORY)}
          >
            <Plus />
            Thêm vật tư mới
          </Button>
        </div>
      ) : filterType === "none" ? null : (
        <TableBarFilter
          filterOptions={filterOptions as Category[]}
          statusTabs={statusTabs}
          defaultStatus={defaultStatus}
          onStatusChange={handleStatusChange}
          onSearchChange={handleSearchChange}
          onFilterChange={(filters) => {
            setColumnFilters(
              Object.entries(filters).map(([id, value]) => ({
                id,
                value,
              }))
            );
          }}
          placeholder={placeholderSearch}
          type={filterType}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta;
                return (
                  <TableHead
                    key={header.id}
                    className={cn("border-b border-sidebar-border", meta?.className)}
                  >
                    {header.isPlaceholder ? null : (
                      <DataTableColumnHeader
                        column={header.column}
                        title={header.column.columnDef.header as string}
                        enableSorting={
                          filterType === "custom" && header.column.getCanSort()
                        }
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-b border-sidebar-border">
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : table?.getRowModel()?.rows?.length ? (
            table?.getRowModel()?.rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-sidebar-border"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as ColumnMeta;
                  return (
                    <TableCell 
                      key={cell.id} 
                      className={cn("py-4", meta?.className)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={Array.isArray(columns) ? columns.length : 1}
                className="h-24 text-center"
              >
                Không có kết quả.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {filterType !== "none" && <DataTablePagination table={table} onPageChange={onPageChange} onLimitChange={onLimitChange} page={page} limit={limit} total={total} />}
    </div>
  );
}
