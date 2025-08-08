"use client";

import { useModal } from "@/contexts/modal-context";
import { ModalView } from "../Modal/modal-view";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { ModalType } from "@/types/modal";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  buttonName?: string;
  actions?: boolean;
  modalType?: ModalType;
  subTitle?: string;
  onActionClick?: () => void;
}

export function PageContainer({
  children,
  className,
  title,
  buttonName,
  actions = false,
  modalType,
  subTitle,
  onActionClick,
}: PageContainerProps) {
  const { openModal } = useModal();

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    } else if (modalType) {
      openModal(modalType);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subTitle && (
            <p className="text-lg text-muted-foreground">{subTitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <Button onClick={handleActionClick}>
              <Plus className="w-4 h-4 mr-2" />
              {buttonName}
            </Button>
          )}
        </div>
      </div>
      {children}
      <ModalView />
    </div>
  );
}
