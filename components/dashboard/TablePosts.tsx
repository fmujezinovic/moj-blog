"use client";

import { useEffect } from "react";


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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

type Post = {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
  is_draft?: boolean | null;
  categories: { slug: string; name: string };
};

export default function TablePosts({ data }: { data: Post[] }) {
  const supabase = createClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [posts, setPosts] = useState<Post[]>(() =>
    data.map(post => ({
      ...post,
      is_draft: post.is_draft === null ? true : post.is_draft === true,
    }))
  );

  useEffect(() => {
  const channel = supabase.channel("realtime-posts")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "posts",
      },
      (payload) => {
        console.log("🔄 Post updated:", payload);
        fetchLatestPosts(); // funkcija ispod
        toast.success("Post osvežen!");
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
  }, []);
  
  const fetchLatestPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, published_at, is_draft, categories(name, slug)");

  if (!error && data) {
    setPosts(
      data.map(post => ({
        ...post,
        is_draft: post.is_draft === null ? true : post.is_draft === true,
      }))
    );
  }
};


  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Post izbrisan");
    setPosts(p => p.filter(r => r.id !== id));
    setOpenDeleteId(null);
  };

  const uniqueCategories = Array.from(
    new Set(data.map(p => p.categories?.name).filter(Boolean))
  );

const columns: ColumnDef<Post>[] = [
{
  accessorKey: "title",
  header: "Naslov",
  cell: ({ row }) => {
    const post = row.original;
    return (
      <Link
        href={`/dashboard/posts/${post.slug}/view`}
        className="text-primary font-medium hover:underline"
      >
        {post.title}
      </Link>
    );
  },
},

  {
    id: "category",
    header: "Kategorija",
    accessorFn: row => row.categories?.name ?? "—",
    cell: ({ row }) => row.original.categories?.name ?? "—",
    sortingFn: (a, b) => {
      const aVal = a.original.categories?.name || "";
      const bVal = b.original.categories?.name || "";
      return aVal.localeCompare(bVal);
    },
  },
  {
    accessorKey: "is_draft",
    header: "Draft",
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <span className="text-xs px-2 py-1 text-[#4b0082] rounded-md">✅</span>
      ) : (
        <span className="text-xs px-2 py-1 text-[#4b0082] rounded-md">❌</span>
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
    const publishedAt = post.published_at ? new Date(post.published_at) : null;

    if (post.is_draft && publishedAt && publishedAt > now) {
      return (
        <span className="text-[#6a0dad] font-semibold">
          🕒 Scheduled
        </span>
      );
    }

    if (post.is_draft) {
      return (
        <span className="text-[#4b0082] font-semibold">
          ✅ Draft
        </span>
      );
    }

    return (
      <span className="text-[#8a2be2] font-semibold">
        ✔️ Published
      </span>
    );
  },
},
{
  accessorKey: "published_at",
  header: "Objavljeno",
  cell: ({ getValue }) =>
    getValue<string | null>()
      ? new Date(getValue<string>()).toLocaleString("sl-SI", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
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

        {/* Alert dialog za potrditev brisanja */}
        <AlertDialog
          open={openDeleteId === post.id}
          onOpenChange={(open) => !open && setOpenDeleteId(null)}
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
}

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

  const filteredRows = table.getRowModel().rows.filter(r => {
    const matchesSearch = [r.original.title, r.original.slug].some(f =>
      f?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesCategory = categoryFilter === "all"
      ? true
      : r.original.categories?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Pretraži po naslovu"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-80"
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter po kategoriji" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Vse kategorije</SelectItem>
            {uniqueCategories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
           <td
          key={c.id}
          className={`
            px-2 py-1
            ${c.column.id === "title" ? "max-w-[300px] whitespace-normal break-words" : ""}
          `}
        >
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
