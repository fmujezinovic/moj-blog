"use client";

import { useRouter } from "next/navigation";
import { useState }  from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  ColumnDef, flexRender,
} from "@tanstack/react-table";

import { Input }     from "@/components/ui/input";
import { Button }    from "@/components/ui/button";
import { Checkbox }  from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter,
  DialogTrigger, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Pencil, Trash2 } from "lucide-react";
import { toast }          from "sonner";
import { createClient }   from "@/utils/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  content_md?: string;
  published_at: string | null;
  is_draft?: boolean;
  categories: { slug: string };          // slug kategorije iz JOIN-a
};

export default function TablePosts({ data }: { data: Post[] }) {
  const supabase = createClient();
  const router   = useRouter();

  const [search, setSearch]       = useState("");
  const [posts,  setPosts]        = useState<Post[]>(data);
  const [openDialog,  setOpenDialog]    = useState(false);
  const [editData,    setEditData]      = useState<Post | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content_md: "",
    is_draft: true,
  });

  /* ------------ EDIT ------------ */
  function handleEdit(post: Post) {
    setEditData(post);
    setForm({
      title:      post.title,
      slug:       post.slug,
      content_md: post.content_md ?? "",
      is_draft:   post.is_draft ?? true,
    });
    setOpenDialog(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckboxChange = (checked: boolean) =>
    setForm({ ...form, is_draft: checked });

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content_md) {
      toast.error("Popuni sva obavezna polja");
      return;
    }

    if (editData) {
      const { error } = await supabase
        .from("posts").update(form).eq("id", editData.id);
      if (error) return toast.error("Greška pri ažuriranju");
      toast.success("Post ažuriran");
      setPosts(p => p.map(r => (r.id === editData.id ? { ...r, ...form } : r)));
    } else {
      const { data: newPost, error } = await supabase
        .from("posts").insert([form]).select().single();
      if (error) return toast.error("Greška pri dodavanju");
      toast.success("Post dodan");
      setPosts(p => [newPost!, ...p]);
    }

    setOpenDialog(false);
    setEditData(null);
    setForm({ title: "", slug: "", content_md: "", is_draft: true });
  };

  /* ------------ DELETE ------------ */
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Post izbrisan");
    setPosts(p => p.filter(r => r.id !== id));
    setOpenDeleteId(null);
  };

  /* ------------ COLUMNS ------------ */
  const columns: ColumnDef<Post>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "slug",  header: "Slug" },
    {
      accessorKey: "categories.slug",
      header: "Category",
      cell: ({ getValue }) => getValue<string>().replace(/-/g, " "),
    },
    {
      accessorKey: "published_at",
      header: "Published",
      cell: ({ getValue }) =>
        getValue<string | null>()
          ? new Date(getValue<string>()).toLocaleDateString("sl-SI")
          : "—",
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <>
            <div className="flex gap-2">
              {/* 👁 View */}
              <Button
                size="icon" variant="secondary" title="View"
                onClick={() => router.push(`/dashboard/posts/${post.slug}/view`)}
              >
                👁
              </Button>

              {/* ✏ Edit */}
              <Button
                size="icon" variant="outline" title="Edit"
                onClick={() => router.push(`/dashboard/posts/${post.slug}/edit`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/* 🗑 Delete */}
              <Button
                size="icon" variant="ghost" title="Delete"
                className="text-red-500 hover:text-red-700"
                onClick={() => setOpenDeleteId(post.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Confirm dialog */}
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
  });

  const filteredRows = table
    .getRowModel()
    .rows.filter(r =>
      [r.original.title, r.original.slug]
        .some(f => f?.toLowerCase().includes(search.toLowerCase())),
    );

  /* ------------ RENDER ------------ */
  return (
    <div>
      {/* search + add */}
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Pretraži po naslovu ili slug-u…"
          value={search}
          onChange={e => setSearch(e.target.value)}
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

            {/* simple form */}
            <div className="grid gap-4 py-4">
              <Input name="title"  placeholder="Naslov" value={form.title} onChange={handleChange}/>
              <Input name="slug"   placeholder="Slug (npr. moj-post)" value={form.slug} onChange={handleChange}/>
              <textarea
                name="content_md"
                placeholder="Markdown sadržaj…"
                value={form.content_md}
                onChange={handleChange}
                className="border rounded p-2 h-32"
              />
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.is_draft} onCheckedChange={val => handleCheckboxChange(!!val)} />
                <span>Draft</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Spremi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* table */}
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
                      asc:  " ↑",
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
