'use client'

import * as React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface Column<T> {
  key: string
  label: string
  render?: (value: any, item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  getRowId?: (item: T, index: number) => string | number
}

export function DataTable<T>({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  getRowId 
}: DataTableProps<T>) {
  
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-gray-600">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    )
  }

    return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="table-auto w-full">
          <TableHeader>
            <TableRow className="bg-orange-500 hover:bg-orange-500">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={`text-white font-bold uppercase text-xs tracking-wider py-5 px-6 whitespace-nowrap ${column.headerClassName || ''}`}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-100">
            {data.map((item, index) => (
              <TableRow 
                key={getRowId ? String(getRowId(item, index)) : index}
                className="hover:bg-orange-50/50 transition-colors duration-200"
              >
                {columns.map((column) => {
                  const value = (item as any)[column.key]
                  return (
                    <TableCell 
                      key={column.key} 
                      className={`py-4 px-6 ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(value, item, index)
                        : value != null ? String(value) : '-'
                      }
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
