"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
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
  content_md: string;
  category_id: string | null;
  published_at: string | null;
  is_draft: boolean;
};

interface TablePostsProps {
  data: Post[];
}

export default function TablePosts({ data }: TablePostsProps) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<Post[]>(data);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<Post | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content_md: "",
    category_id: "",
    is_draft: true,
  });

  function handleEdit(post: Post) {
    setEditData(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content_md: post.content_md,
      category_id: post.category_id || "",
      is_draft: post.is_draft,
    });
    setOpenDialog(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setForm({ ...form, is_draft: checked });
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content_md) {
      toast.error("Popuni sva obavezna polja (title, slug, content_md)");
      return;
    }

    if (editData) {
      const { error } = await supabase.from("posts").update(form).eq("id", editData.id);
      if (error) return toast.error("Greška pri ažuriranju");
      toast.success("Post ažuriran");

      setPosts((prev) =>
        prev.map((p) => (p.id === editData.id ? { ...p, ...form } : p))
      );
    } else {
      const { data: newPost, error } = await supabase.from("posts").insert([form]).select().single();
      if (error) return toast.error("Greška pri dodavanju");
      toast.success("Post dodan");

      setPosts((prev) => [newPost!, ...prev]);
    }

    setOpenDialog(false);
    setEditData(null);
    setForm({
      title: "",
      slug: "",
      content_md: "",
      category_id: "",
      is_draft: true,
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Post izbrisan");

    setPosts((prev) => prev.filter((p) => p.id !== id));
    setOpenDeleteId(null);
  };

  const columns: ColumnDef<Post>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "category_id", header: "Category ID" },
    { accessorKey: "is_draft", header: "Draft", cell: ({ getValue }) => (getValue() ? "Yes" : "No") },
    { accessorKey: "published_at", header: "Published At" },
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
                onClick={() => handleEdit(post)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                onClick={() => setOpenDeleteId(post.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <AlertDialog open={openDeleteId === post.id} onOpenChange={(open) => !open && setOpenDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Da li si siguran da želiš obrisati post?</AlertDialogTitle>
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
  });

  const filtered = table.getRowModel().rows.filter(post =>
    [post.original.title, post.original.slug]
      .some(field => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Pretraži po naslovu ili slug-u..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96"
        />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>Dodaj Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editData ? "Uredi" : "Dodaj"} Post</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="title" placeholder="Naslov" value={form.title} onChange={handleChange} />
              <Input name="slug" placeholder="Slug (npr. moj-post)" value={form.slug} onChange={handleChange} />
              <textarea
                name="content_md"
                placeholder="Markdown sadržaj..."
                value={form.content_md}
                onChange={handleChange}
                className="border rounded p-2 h-32"
              />
              <Input name="category_id" placeholder="Kategorija ID (opciono)" value={form.category_id} onChange={handleChange} />
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.is_draft} onCheckedChange={(val) => handleCheckboxChange(!!val)} />
                <span>Draft</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Spremi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="min-w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer px-4 py-2 text-left font-medium whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
            {filtered.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
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
