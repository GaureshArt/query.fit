
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
  TableCaption,
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
  const columns = React.useMemo<ColumnDef<Record<string, any>>[]>(() => {
    if (data.length === 0) return [];
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    
    <div
      className={cn(
        "rounded-md border w-full max-w-full",
        className,
        " [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      )}
    >
      <Table className="md  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TableCaption>Query result</TableCaption>
        <TableHeader className={cn("bg-foreground ")}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="max-w-[180px] truncate text-background font-bold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className=" [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border">
                    <div
                      className="max-w-[260px] truncate overflow-hidden whitespace-nowrap "
                      title={String(cell.getValue?.() ?? "")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
    </div>
  );
}
