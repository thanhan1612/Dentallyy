"use client"

interface ContentWrapperProps {
  children: React.ReactNode
}

export function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className="flex-1 relative">
      {children}
    </div>
  )
}
