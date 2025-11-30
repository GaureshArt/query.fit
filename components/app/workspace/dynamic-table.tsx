"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DynamicTableProps {
  data: Record<string, any>[];
  className?: string;
}

export function DynamicTable({ data, className }: DynamicTableProps) {
  const [page, setPage] = React.useState(1);
  const pageSize = 20; 

  const columns = React.useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (data.length === 0 || !(data instanceof Array)) return [];
    setPage(1);
    const keys = Object.keys(data[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => (
        <div className="max-w-[220px] truncate overflow-hidden whitespace-nowrap">
          {String(row.getValue(key))}
        </div>
      ),
    }));
  }, [data]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [page, data]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageCount = Math.ceil(data.length / pageSize);

  return (
    <div className={cn("w-full max-w-full", className)}>
      <Table className="w-full">
        <TableHeader className="bg-foreground ">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="max-w-[180px] truncate font-bold text-white"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border">
                    <div
                      className="max-w-[260px] truncate overflow-hidden whitespace-nowrap"
                      title={String(cell.getValue?.() ?? "")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm">
          Page {page} of {pageCount}
        </span>

        <button
          disabled={page === pageCount}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
