import { createClient } from "@/utils/supabase/server";
import TableCategories from "@/components/dashboard/TableCategories";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kategorije</h1>
      <TableCategories data={categories || []} />
    </div>
  );
}
