import { Column } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  className?: string
  enableSorting?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableSorting = false
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!enableSorting) {
    return (
      <div className={cn("flex items-center space-x-2 py-3", className)}>
        <span className="text-muted-foreground">{title}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2 py-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="text-muted-foreground">{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
