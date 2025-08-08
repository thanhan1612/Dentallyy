import { ReactNode } from "react"

export enum ModalType {
  PATIENT = "PATIENT",
  APPOINTMENT = "APPOINTMENT",
  TREATMENT = "TREATMENT",
  MEDICAL_RECORD = "MEDICAL_RECORD",
  INVENTORY = "INVENTORY",
  PATIENT_INFORMATION = "PATIENT_INFORMATION",
  STAFF = "STAFF",
  PAYMENT = "PAYMENT",
  PAYMENT_HISTORY = "PAYMENT_HISTORY",
  SERVICE = "SERVICE",
}

export interface BaseModalContent {
  content: ReactNode;
  requiresData: boolean;
}

export interface ModalContentWithoutData extends BaseModalContent {
  requiresData: false;
}

export interface ModalContentWithData extends BaseModalContent {
  requiresData: true;
}

export type ModalContent = ModalContentWithoutData | ModalContentWithData;

export type ModalContentMap = {
  [key in ModalType]: ModalContent;
}; 