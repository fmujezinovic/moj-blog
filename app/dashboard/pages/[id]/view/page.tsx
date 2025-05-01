"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MDXContent from "@/components/RenderedMDX";

export default function ViewPage() {
  const { id } = useParams();
  const [page, setPage] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setPage(data);
      }
    };

    fetchPage();
  }, [id]);

  if (!page) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
          <div className="text-muted-foreground text-sm space-x-4">
            <span>Status: {page.is_draft ? "Draft" : "Published"}</span>
            {page.published_at && (
              <span>
                Publish Date:{" "}
                {new Date(page.published_at).toLocaleString("sl-SI")}
              </span>
            )}
          </div>
        </div>
        
        <Button asChild variant="outline">
          <a href={`/dashboard/pages/${id}/edit`}>✏️ Edit</a>
        </Button>
      </div>

      <Card className="p-6">
        {page.description && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <h2 className="text-sm font-semibold mb-2">Meta Description:</h2>
            <p className="text-muted-foreground">{page.description}</p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <MDXContent>{page.content_md || ""}</MDXContent>
        </div>
      </Card>
    </main>
  );
}