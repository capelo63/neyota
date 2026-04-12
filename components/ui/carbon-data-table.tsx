import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Carbon DataTable - Tableau de données inspiré d'IBM Carbon Design System
 * Features: zebra stripes, hover states, sticky header, responsive
 */

export interface Column<T> {
  key: string
  header: string
  accessor: (row: T) => React.ReactNode
  width?: string
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  className?: string
  zebra?: boolean
  hoverable?: boolean
  stickyHeader?: boolean
  compact?: boolean
  selectable?: boolean
  onRowSelect?: (row: T, selected: boolean) => void
  selectedRows?: Set<number>
}

function DataTable<T>({
  columns,
  data,
  className,
  zebra = true,
  hoverable = true,
  stickyHeader = false,
  compact = false,
  selectable = false,
  onRowSelect,
  selectedRows = new Set(),
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return

    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: "asc" }
    })
  }

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      if (!column) return 0

      const aValue = column.accessor(a)
      const bValue = column.accessor(b)

      if (aValue === bValue) return 0

      // Handle null/undefined values
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Convert to string for comparison if needed
      const aStr = String(aValue)
      const bStr = String(bValue)

      const comparison = aStr > bStr ? 1 : -1
      return sortConfig.direction === "asc" ? comparison : -comparison
    })
  }, [data, sortConfig, columns])

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead
          className={cn(
            "bg-layer-02 text-left text-sm font-semibold",
            stickyHeader && "sticky top-0 z-10"
          )}
        >
          <tr className="border-b border-border">
            {selectable && (
              <th className={cn("px-4", compact ? "py-2" : "py-3")}>
                <input
                  type="checkbox"
                  className="rounded border-border"
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  "px-4 font-mono text-xs uppercase tracking-wider",
                  compact ? "py-2" : "py-3",
                  column.sortable && "cursor-pointer select-none hover:bg-layer-hover-02"
                )}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="text-primary">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-border transition-colors",
                zebra && rowIndex % 2 === 1 && "bg-layer-01",
                hoverable && "hover:bg-layer-hover-01",
                selectedRows.has(rowIndex) && "bg-primary/10"
              )}
            >
              {selectable && (
                <td className={cn("px-4", compact ? "py-2" : "py-3")}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={(e) => onRowSelect?.(row, e.target.checked)}
                    className="rounded border-border"
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 text-sm",
                    compact ? "py-2" : "py-3"
                  )}
                >
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      )}
    </div>
  )
}

DataTable.displayName = "DataTable"

export { DataTable }
