import { TableAction } from "@/components/Table/table-actions"
import { CreditCard, Printer, History } from "lucide-react"
import { useModal } from "@/contexts/modal-context"
import { ModalType } from "@/types/modal"

export const usePaymentTableActions = () => {
    const { openModal } = useModal()
    const paymentTabAction: TableAction[] = [
        {
            label: "Ghi nhận thanh toán",
            icon: <CreditCard className="h-4 w-4" />,
            onClick: (data) => {
                let totalPaid = 0;
                try {
                    const paidData = Array.isArray(data?.paid) ? data.paid : [];
                    totalPaid = paidData.reduce((sum: number, payment: string) => {
                        const paymentData = JSON.parse(payment);
                        return sum + Number(paymentData?.paid_amount || 0);
                    }, 0);
                } catch (error) {
                    console.error('Error calculating total paid:', error);
                }
                
                const remainingAmount = data?.cost - totalPaid;
                openModal(ModalType.PAYMENT, {
                    id: data?.$id,
                    cost: remainingAmount,
                    paid: data?.paid
                })
            },
            actionType: "basic",
            className: (data) => data?.status === "completed" ? "hidden" : ""
        },
        {
            label: "Xem lịch sử",
            icon: <History className="h-4 w-4" />,
            actionType: "basic",
            onClick: (data) => {
                openModal(ModalType.PAYMENT_HISTORY, {
                    data: data?.paid
                })
            },
        },
        {
            label: "In hóa đơn",
            icon: <Printer className="h-4 w-4" />,
            actionType: "basic",
            onClick: () => {
                console.log("In hóa đơn")
            },
        }
    ]
    return paymentTabAction
}
