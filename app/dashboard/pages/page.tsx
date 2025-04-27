import { createClient } from "@/utils/supabase/server";
import TablePages from "@/components/dashboard/TablePages";

export default async function PagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase.from("pages").select("*");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pages</h1>
      <TablePages data={pages || []} />
    </div>
  );
}
