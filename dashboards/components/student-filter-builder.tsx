"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Plus, X, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import type { StudentFilterFieldMeta } from "@/lib/api-client"
import type { CorporateMerchant } from "@/lib/api-client"
import {
  type FilterRow,
  OPERATOR_LABELS,
  createEmptyFilterRow,
  getDefaultOperator,
  isBetweenOperator,
  isBooleanOperator,
  isInOperator,
} from "@/lib/student-filter-config"

interface StudentFilterBuilderProps {
  rows: FilterRow[]
  onChange: (rows: FilterRow[]) => void
  fieldMetadata: StudentFilterFieldMeta[]
  merchants?: CorporateMerchant[]
}

function parseDateRange(value: string | string[]): DateRange | undefined {
  if (!Array.isArray(value) || value.length < 2) return undefined
  const from = value[0] ? new Date(value[0]) : undefined
  const to = value[1] ? new Date(value[1]) : undefined
  if (!from && !to) return undefined
  return { from, to }
}

function FilterValueInput({
  row,
  fieldMeta,
  merchants,
  onChange,
}: {
  row: FilterRow
  fieldMeta?: StudentFilterFieldMeta
  merchants?: CorporateMerchant[]
  onChange: (value: string | string[]) => void
}) {
  if (!fieldMeta || !row.operator) {
    return <Input disabled placeholder="Select field and operator" className="flex-1" />
  }

  if (isBooleanOperator(row.operator)) {
    return null
  }

  const type = fieldMeta.type

  if (isBetweenOperator(row.operator)) {
    if (type === 'date' || fieldMeta.key === 'redemption_date' || fieldMeta.key === 'created_at' || fieldMeta.key === 'date_of_birth') {
      const range = parseDateRange(row.value)
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !range?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>{format(range.from, "LLL dd, y")} - {format(range.to, "LLL dd, y")}</>
                ) : (
                  format(range.from, "LLL dd, y")
                )
              ) : (
                <span>Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => {
                if (r?.from) {
                  onChange([
                    r.from.toISOString(),
                    r.to ? r.to.toISOString() : r.from.toISOString(),
                  ])
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )
    }

    const arr = Array.isArray(row.value) ? row.value : ['', '']
    return (
      <div className="flex flex-1 items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={arr[0] || ''}
          onChange={(e) => onChange([e.target.value, arr[1] || ''])}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="Max"
          value={arr[1] || ''}
          onChange={(e) => onChange([arr[0] || '', e.target.value])}
        />
      </div>
    )
  }

  if (isInOperator(row.operator)) {
    const strVal = Array.isArray(row.value) ? row.value.join(', ') : String(row.value || '')
    return (
      <Input
        className="flex-1"
        placeholder="Comma-separated values"
        value={strVal}
        onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
      />
    )
  }

  if (fieldMeta.key === 'redemption_merchant' && merchants && merchants.length > 0) {
    return (
      <Select value={String(row.value || '')} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select merchant" />
        </SelectTrigger>
        <SelectContent>
          {merchants.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.businessName}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (type === 'enum' && fieldMeta.enumOptions && fieldMeta.enumOptions.length > 0) {
    return (
      <Select value={String(row.value || '')} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {fieldMeta.enumOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (type === 'date' || fieldMeta.key === 'redemption_date') {
    const dateVal = Array.isArray(row.value) ? row.value[0] : String(row.value || '')
    return (
      <Input
        type="date"
        className="flex-1"
        value={dateVal ? dateVal.split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
      />
    )
  }

  if (type === 'number') {
    return (
      <Input
        type="number"
        className="flex-1"
        placeholder="Value"
        value={Array.isArray(row.value) ? row.value[0] : String(row.value || '')}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  return (
    <Input
      className="flex-1"
      placeholder="Value"
      value={Array.isArray(row.value) ? row.value.join(', ') : String(row.value || '')}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function StudentFilterBuilder({
  rows,
  onChange,
  fieldMetadata,
  merchants,
}: StudentFilterBuilderProps) {
  const fieldMap = useMemo(
    () => new Map(fieldMetadata.map((f) => [f.key, f])),
    [fieldMetadata],
  )

  const updateRow = (id: string, patch: Partial<FilterRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id))
  }

  const addRow = () => {
    onChange([...rows, createEmptyFilterRow()])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Filters</Label>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 h-3 w-3" />
          Add Filter
        </Button>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No filters applied. Use shortcuts below or add a filter.</p>
      )}

      {rows.map((row) => {
        const fieldMeta = fieldMap.get(row.field)
        const operators = fieldMeta?.operators ?? []

        return (
          <div key={row.id} className="flex flex-wrap items-center gap-2">
            <Select
              value={row.field || undefined}
              onValueChange={(field) => {
                const meta = fieldMap.get(field)
                const op = getDefaultOperator(meta)
                updateRow(row.id, { field, operator: op, value: op === 'between' ? ['', ''] : '' })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Attribute" />
              </SelectTrigger>
              <SelectContent>
                {fieldMetadata.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={row.operator || undefined}
              onValueChange={(operator) => {
                const val = isBetweenOperator(operator) ? ['', ''] : ''
                updateRow(row.id, { operator, value: val })
              }}
              disabled={!row.field}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op} value={op}>{OPERATOR_LABELS[op] || op}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterValueInput
              row={row}
              fieldMeta={fieldMeta}
              merchants={merchants}
              onChange={(value) => updateRow(row.id, { value })}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => removeRow(row.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
