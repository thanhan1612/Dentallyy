"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (data: any) => void;
  className?: string | ((data: any) => string);
  actionType?: "basic" | "danger";
}

interface TableActionsProps {
  data: any;
  actions: TableAction[];
}

export function TableActions({ data, actions }: TableActionsProps) {
  const [open, setOpen] = useState(false);
  
  // Filter out hidden actions
  const visibleActions = actions.filter(action => {
    const className = typeof action.className === 'function' 
      ? action.className(data)
      : action.className;
    return className !== "hidden";
  });

  // If no visible actions, don't render anything
  if (visibleActions.length === 0) {
    return null;
  }

  const sortedActions = [...visibleActions].sort((a, b) => {
    if (a.actionType === "danger" && b.actionType !== "danger") return 1;
    if (a.actionType !== "danger" && b.actionType === "danger") return -1;
    return 0;
  });

  const handleActionClick = (action: TableAction) => {
    setOpen(false);
    action.onClick(data);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        <div className="px-2 py-1.5 text-sm font-semibold border-b border-sidebar-border">
          Hành động
        </div>
        {sortedActions.map((action, index) => {
          const className = typeof action.className === 'function' 
            ? action.className(data)
            : action.className;
            
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                "px-2 py-1.5 text-sm",
                className,
                action.actionType === "danger" &&
                  " text-red-600 border-t border-sidebar-border focus:text-red-600"
              )}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
