"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { ViewLiveButton } from "@/components/posts/ViewLiveButton";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

type Page = {
  id: string;
  title: string;
  slug: string;
  content_md: string | null;
  description: string | null;
  published_at: string | null;
  is_draft: boolean;
  created_at: string | null;
  updated_at: string | null;
};

interface TablePagesProps {
  data: Page[];
}

export default function TablePages({ data }: TablePagesProps) {
  const supabase = createClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<Page[]>(data);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) return toast.error("Napaka pri brisanju.");
    toast.success("Stran izbrisana.");
    setPages((prev) => prev.filter((p) => p.id !== id));
    setOpenDeleteId(null);
  };

  const columns: ColumnDef<Page>[] = [
    {
  accessorKey: "title",
  header: "Title",
  cell: ({ row }) => {
    const page = row.original;
    const href = `/${page.slug}`; // ustvari direktni URL
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary font-medium hover:underline"
      >
        {page.title}
      </Link>
    );
  },
},
    { accessorKey: "slug", header: "Slug" },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleDateString() : "-",
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleDateString() : "-",
    },
    {
      accessorKey: "is_draft",
      header: "Draft",
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    },
    
    {
      header: "Actions",
      cell: ({ row }) => {
        const page = row.original;

        return (
          <>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => router.push(`/dashboard/pages/${page.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => setOpenDeleteId(page.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <AlertDialog
              open={openDeleteId === page.id}
              onOpenChange={(open) => !open && setOpenDeleteId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Izbrisati stran?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Prekliči</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(page.id)}>
                    Izbriši
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: pages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filtered = table.getRowModel().rows.filter((row) =>
    [row.original.title, row.original.slug]
      .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Išči po naslovu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96"
        />
        <Button onClick={() => router.push("/dashboard/pages/create")}>
          Dodaj Stranicu
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-2 text-left font-medium whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 border-t">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
