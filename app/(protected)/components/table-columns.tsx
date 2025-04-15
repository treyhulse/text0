"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Document } from "@/lib/redis";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import Link from "next/link";

// Document columns
export const documentColumns: ColumnDef<Document>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <Link
        href={`/docs/${row.original.id}`}
        className="group flex items-center gap-2 font-medium hover:text-primary"
      >
        {row.getValue("name")}
        <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
      </Link>
    ),
    size: 200,
  },
  {
    header: "Content Preview",
    accessorKey: "content",
    size: 400,
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[400px] text-muted-foreground text-sm">
        {row.getValue("content")}
      </div>
    ),
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    size: 120,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
];

// Reference type matching Redis structure
export interface Reference extends Record<string, unknown> {
  id: string;
  userId: string;
  url: string;
  name?: string;
  uploadedAt: string;
  chunksCount: number;
  processed: boolean;
  filename?: string;
}

export const referenceColumns: ColumnDef<Reference>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
  },
  {
    header: "Name",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("name") || row.getValue("filename") || "Untitled"}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "processed",
    size: 120,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.getValue("processed") ? (
          <Badge
            variant="default"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Processed
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        )}
      </div>
    ),
  },
  {
    header: "Chunks",
    accessorKey: "chunksCount",
    size: 100,
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("chunksCount")} chunks</div>
    ),
  },
  {
    header: "Source",
    accessorKey: "url",
    size: 200,
    cell: ({ row }) => (
      <Link
        href={row.getValue("url")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-muted-foreground text-sm hover:text-primary"
      >
        <ExternalLink className="h-3 w-3" />
        {new URL(row.getValue("url")).hostname}
      </Link>
    ),
  },
  {
    header: "Added On",
    accessorKey: "uploadedAt",
    size: 120,
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.getValue("uploadedAt")).toLocaleDateString()}
      </div>
    ),
  },
];
