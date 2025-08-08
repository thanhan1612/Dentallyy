"use client"

import type React from "react"
import { useSidebar } from "../../contexts/sidebar-context"
import { DashboardSidebar } from "./sidebar"
import { cn } from "@/lib/utils"

export function SidebarContainer() {
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-in-out" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar - fixed positioned on the left */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 h-screen",
          "transition-transform duration-300 ease-in-out",
          "transform-gpu",
          isOpen ? "w-[16rem]" : "w-[4.5rem]",
          isMobile && "w-[16rem]",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <DashboardSidebar />
      </div>

      {/* Toggle button for mobile */}
      {isMobile && !isOpen && (
        <button
          className="fixed bottom-4 left-4 z-50 rounded-full bg-primary p-3 text-white shadow-lg transition-transform duration-300 hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}
    </>
  )
}
