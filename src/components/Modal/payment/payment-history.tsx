"use client";

import { formatDateToDisplay } from "@/utils/date-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useModal } from "@/contexts/modal-context";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function PaymentHistory() {
  const { modalData } = useModal();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <DialogTitle>Lịch sử thanh toán</DialogTitle>
        <DialogDescription>
          Thông tin lịch sử thanh toán
        </DialogDescription>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày thanh toán</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modalData?.data?.map((record: any , index: number) => (
              <TableRow key={index}>
                <TableCell>{formatDateToDisplay(JSON.parse(record).date)}</TableCell>
                <TableCell>{Number(JSON.parse(record).paid_amount).toLocaleString('vi-VN')} VNĐ</TableCell>
                <TableCell>{JSON.parse(record).notes || "-"}</TableCell>
              </TableRow>
            ))}
            {(modalData?.data?.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Không có lịch sử thanh toán
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
