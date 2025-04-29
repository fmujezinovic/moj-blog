"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

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
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Post type definition
type Post = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  is_draft?: boolean | null;
  categories: { slug: string };
};

export default function TablePosts({ data }: { data: Post[] }) {
  const supabase = createClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<Post[]>(() =>
    data.map(post => ({
      ...post,
      is_draft: post.is_draft === null ? true : post.is_draft === true,
    }))
  );
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Post izbrisan");
    setPosts(p => p.filter(r => r.id !== id));
    setOpenDeleteId(null);
  };

  const columns: ColumnDef<Post>[] = [
    { accessorKey: "title", header: "Title" },
    {
      accessorKey: "is_draft",
      header: "Draft",
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <span className="text-xs px-2 py-1 text-[#4b0082] rounded-md">✅</span>
        ) : (
          <span className="text-xs px-2 py-1 text-[#4b0082]  rounded-md">-</span>
        ),
      sortingFn: (a, b) => {
        const aDraft = a.getValue<boolean>("is_draft") ?? false;
        const bDraft = b.getValue<boolean>("is_draft") ?? false;
        return aDraft === bDraft ? 0 : aDraft ? -1 : 1;
      },
    },
    {
      header: "Status",
      cell: ({ row }) => {
        const post = row.original;
        const now = new Date();

        if (post.is_draft) {
          return <span className="text-[#4b0082] font-semibold">✅ Draft</span>;
        }

        if (post.published_at && new Date(post.published_at) > now) {
          return <span className="text-[#6a0dad] font-semibold">🕒 Scheduled</span>;
        }

        return <span className="text-[#8a2be2] font-semibold">✔️ Published</span>;
      },
    },
    {
      accessorKey: "published_at",
      header: "Published",
      cell: ({ getValue }) =>
        getValue<string | null>()
          ? new Date(getValue<string>()).toLocaleDateString("sl-SI")
          : "—",
      sortingFn: (a, b) => {
        const aDate = new Date(a.getValue<string | null>("published_at") || 0).getTime();
        const bDate = new Date(b.getValue<string | null>("published_at") || 0).getTime();
        return bDate - aDate;
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                title="View"
                onClick={() => router.push(`/dashboard/posts/${post.slug}/view`)}
              >
                👁
              </Button>
              <Button
                size="icon"
                variant="outline"
                title="Edit"
                onClick={() => router.push(`/dashboard/posts/${post.slug}/edit`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                title="Delete"
                className="text-red-500 hover:text-red-700"
                onClick={() => setOpenDeleteId(post.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <AlertDialog
              open={openDeleteId === post.id}
              onOpenChange={open => !open && setOpenDeleteId(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Obrisati post?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Otkaži</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(post.id)}>
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
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "Status", desc: false }],
    },
  });

  const filteredRows = table
    .getRowModel()
    .rows.filter(r =>
      [r.original.title, r.original.slug]
        .some(f => f?.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div>
      {/* Search + Add */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Pretraži po naslovu ali slug-u…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-96"
        />

        <Link href="/dashboard/posts/new">
          <Button variant="default">Dodaj Post</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-2 text-left font-medium whitespace-nowrap"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {filteredRows.map(r => (
              <tr key={r.id} className="border-t">
                {r.getVisibleCells().map(c => (
                  <td key={c.id} className="px-4 py-2">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
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