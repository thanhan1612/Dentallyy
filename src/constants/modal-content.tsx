import { ModalContentMap, ModalType, ModalContentWithoutData, ModalContentWithData } from "@/types/modal"
import { ModalPatient } from "@/components/Modal/patients/modal-patient"
import { AppointmentCreateForm } from "@/components/Modal/appointments/modal-appointments"
import { ModalTreatments } from "@/components/Modal/treatments/modal-treatments"
import { ModalPatientInformation } from "@/components/Modal/patients/modal-patient-information"
import { ModalInventory } from "@/components/Modal/inventory/modal-inventory"
import { ModalPayment } from "@/components/Modal/payment/modal-payment"
import { PaymentHistory } from "@/components/Modal/payment/payment-history"
import ModalService from "@/components/Modal/service/modal-service"
import ModalEmployee from "@/components/Modal/employee/modal-employee"

export const modalContentMap: ModalContentMap = {
  [ModalType.PATIENT]: {
    content: <ModalPatient />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.APPOINTMENT]: {
    content: <AppointmentCreateForm />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.TREATMENT]: {
    content: <ModalTreatments />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.MEDICAL_RECORD]: {
    content: <div>Medical Record Modal Content</div>,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.INVENTORY]: {
    content: <ModalInventory />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.PATIENT_INFORMATION]: {
    content: <ModalPatientInformation />,
    requiresData: true
  } as ModalContentWithData,
  [ModalType.STAFF]: {
    content: <ModalEmployee />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.PAYMENT]: {
    content: <ModalPayment />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.PAYMENT_HISTORY]: {
    content: <PaymentHistory />,
    requiresData: false
  } as ModalContentWithoutData,
  [ModalType.SERVICE]: {
    content: <ModalService />,
    requiresData: false
  } as ModalContentWithoutData,
} 