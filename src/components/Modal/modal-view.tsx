"use client"

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useModal } from "@/contexts/modal-context"
import { modalContentMap } from "@/constants/modal-content"
import { ModalType } from "@/types/modal"
import React from "react"
import { useEmployeeStore } from "@/store/employee-store"

export function ModalView() {
  const { currentModal, closeModal, modalData } = useModal()
  const resetStore = useEmployeeStore((state) => state.resetStore)

  if (!currentModal) return null

  const modalContent = modalContentMap[currentModal as ModalType]

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear store when modal closes
      resetStore()
      closeModal()
    }
  }

  const renderContent = () => {
    if (modalContent.requiresData) {
      return React.cloneElement(modalContent.content as React.ReactElement<any>, { data: modalData })
    }
    return modalContent.content
  }

  return (
    <Dialog open={!!currentModal} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[768px] flex flex-col gap-2">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
