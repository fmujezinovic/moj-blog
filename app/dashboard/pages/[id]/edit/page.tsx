"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import PageFormPage from "@/components/dashboard/PageFormPage";

export default function EditPagePage() {
  const { id } = useParams();
  const [pageData, setPageData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setPageData(data);
      }
    };

    fetchPage();
  }, [id]);

  if (!pageData) return <div className="p-8 text-center">Loading...</div>;

  return <PageFormPage isEdit={true} initialData={pageData} />;
}