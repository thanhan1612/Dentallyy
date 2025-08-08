"use client";

import { ModalType } from "@/types/modal";
import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  openModal: (type: ModalType, data?: any) => void;
  closeModal: () => void;
  currentModal: ModalType | null;
  modalData: any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (type: ModalType, data?: any) => {
    setCurrentModal(type);
    setModalData(data);
  };

  const closeModal = () => {
    setCurrentModal(null);
    setModalData(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, currentModal, modalData }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
