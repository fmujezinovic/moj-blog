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

type Category = {
  id: string;
  name: string;
  slug: string;
};

interface TableCategoriesProps {
  data: Category[];
}

export default function TableCategories({ data }: TableCategoriesProps) {
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>(data);
  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  function handleEdit(category: Category) {
    setEditData(category);
    setForm({
      name: category.name,
      slug: category.slug,
    });
    setOpenDialog(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast.error("Popuni sva obavezna polja (name, slug)");
      return;
    }

    if (editData) {
      const { error } = await supabase.from("categories").update(form).eq("id", editData.id);
      if (error) return toast.error("Greška pri ažuriranju");
      toast.success("Kategorija ažurirana");

      setCategories((prev) =>
        prev.map((c) => (c.id === editData.id ? { ...c, ...form } : c))
      );
    } else {
      const { data: newCategory, error } = await supabase.from("categories").insert([form]).select().single();
      if (error) return toast.error("Greška pri dodavanju");
      toast.success("Kategorija dodana");

      setCategories((prev) => [newCategory!, ...prev]);
    }

    setOpenDialog(false);
    setEditData(null);
    setForm({ name: "", slug: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error("Greška pri brisanju");
    toast.success("Kategorija izbrisana");

    setCategories((prev) => prev.filter((c) => c.id !== id));
    setOpenDeleteId(null);
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Naziv" },
    { accessorKey: "slug", header: "Slug" },
    {
      header: "Akcije",
      cell: ({ row }) => {
        const category = row.original;

        return (
          <>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleEdit(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={() => setOpenDeleteId(category.id)}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            <AlertDialog open={openDeleteId === category.id} onOpenChange={(open) => !open && setOpenDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Želite li sigurno izbrisati kategoriju?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Otkaži</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(category.id)}>
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
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filtered = table.getRowModel().rows.filter(cat =>
    [cat.original.name, cat.original.slug]
      .some(field => field?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Pretraži po nazivu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96"
        />
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>Dodaj Kategoriju</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editData ? "Uredi" : "Dodaj"} Kategoriju</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input name="name" placeholder="Naziv kategorije" value={form.name} onChange={handleChange} />
              <Input name="slug" placeholder="Slug (npr. umetna-inteligenca)" value={form.slug} onChange={handleChange} />
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
