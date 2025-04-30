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
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<Page | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content_md: "",
    description: "",
    is_draft: true,
    published_at: null as string | null,
  });

  function handleEdit(page: Page) {
    setEditData(page);
    setForm({
      title: page.title,
      slug: page.slug,
      content_md: page.content_md || "",
      description: page.description || "",
      is_draft: page.is_draft,
      published_at: page.published_at,
    });
    setOpenDialog(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const { error } = await supabase.from("pages").update(form).eq("id", editData.id);
      if (error) return toast.error("Greška pri ažuriranju");
      toast.success("Stranica ažurirana");

      setPages((prev) =>
        prev.map((p) => (p.id === editData.id ? { ...p, ...form } : p))
      );
    } else {
      const { data: newPage, error } = await supabase.from("pages").insert([form]).select().single();
      if (error) return toast.error("Greška pri dodavanju");
      toast.success("Stranica dodana");

      setPages((prev) => [newPage!, ...prev]);
    }

    setOpenDialog(false);
    setEditData(null);
    setForm({
      title: "",
      slug: "",
      content_md: "",
      description: "",
      is_draft: true,
      published_at: null,
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Stranica izbrisana");

    setPages((prev) => prev.filter((p) => p.id !== id));
    setOpenDeleteId(null);
  };

  const columns: ColumnDef<Page>[] = [
    { accessorKey: "title", header: "Title" },
    { accessorKey: "slug", header: "Slug" },
    { accessorKey: "created_at", header: "Created", cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : "-" },
    { accessorKey: "updated_at", header: "Updated", cell: ({ getValue }) => getValue() ? new Date(getValue() as string).toLocaleDateString() : "-" },
    { accessorKey: "is_draft", header: "Draft", cell: ({ getValue }) => (getValue() ? "Yes" : "No") },
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
                onClick={() => handleEdit(page)}
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

            <AlertDialog open={openDeleteId === page.id} onOpenChange={(open) => !open && setOpenDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Da li si siguran da želiš obrisati stranicu?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Otkaži</AlertDialogCancel>
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

  const filtered = table.getRowModel().rows.filter(page =>
    [page.original.title, page.original.slug]
      .some(field => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Pretraži po naslovu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96"
        />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>Dodaj Stranicu</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editData ? "Uredi" : "Dodaj"} Stranicu</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="title" placeholder="Naslov" value={form.title} onChange={handleChange} />
              <Input name="slug" placeholder="Slug (npr. o-meni)" value={form.slug} onChange={handleChange} />
              <textarea
                name="content_md"
                placeholder="Markdown vsebina..."
                value={form.content_md || ""}
                onChange={handleChange}
                className="border rounded p-2 h-32"
              />
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
