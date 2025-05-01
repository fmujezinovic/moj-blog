"use client";

import { useState, useTransition } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface PageFormPageProps {
  isEdit?: boolean;
  initialData?: {
    id: string;
    title: string;
    slug: string;
    content_md: string;
    description: string;
    is_draft: boolean;
    published_at: string | null;
  };
}

export default function PageFormPage({ isEdit = false, initialData }: PageFormPageProps) {
  const router = useRouter();
  const supabase = createClient();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [content, setContent] = useState(initialData?.content_md ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isDraft, setIsDraft] = useState(initialData?.is_draft ?? true);
  const [publishDate, setPublishDate] = useState<Date | null>(
    initialData?.published_at ? new Date(initialData.published_at) : null
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Naslov i slug su obavezni");
      return;
    }

    if (description.length > 160) {
      toast.error("Meta opis mora biti kraći od 160 znakova");
      return;
    }

    setLoading(true);
    try {
      const pageData = {
        title,
        slug,
        content_md: content,
        description,
        is_draft: isDraft,
        published_at: publishDate?.toISOString() ?? null,
      };

      if (isEdit && initialData) {
        const { error } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", initialData.id);
        
        if (error) throw error;
        toast.success("Stranica ažurirana");
      } else {
        const { error } = await supabase
          .from("pages")
          .insert([pageData]);
        
        if (error) throw error;
        toast.success("Stranica kreirana");
      }
      
      router.push("/dashboard/pages");
    } catch (error) {
      console.error(error);
      toast.error("Greška pri spremanju");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-6">
          <CardTitle className="text-3xl font-bold">
            {isEdit ? "Uredi Stranicu" : "Kreiraj Novu Stranicu"}
          </CardTitle>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-semibold">Naslov</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unesi naslov stranice"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-semibold">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="unesi-slug"
            />
          </div>

          {/* Meta Description */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-semibold">Meta Opis</Label>
            <div className="flex flex-col gap-1">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Kratak opis za SEO (preporučeno do 160 znakova)"
                rows={3}
                className={description.length > 160 ? "border-red-500" : ""}
              />
              <div className="text-sm text-right">
                <span className={description.length > 160 ? "text-red-500" : "text-muted-foreground"}>
                  {description.length} / 160
                </span>
              </div>
            </div>
          </div>

          {/* Draft Switch + Publish Date */}
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <Switch
                checked={!isDraft}
                onCheckedChange={(checked) => setIsDraft(!checked)}
                id="published-switch"
              />
              <Label htmlFor="published-switch" className="text-md font-semibold">
                Objavljeno
              </Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-md font-semibold">Datum Objave</Label>
              <DatePicker
                selected={publishDate}
                onChange={(date) => setPublishDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                placeholderText="Izaberi datum i vrijeme objave"
                className="border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content */}
          <div className="flex flex-col gap-2">
            <Label className="text-md font-semibold">Sadržaj</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Unesi sadržaj stranice u Markdown formatu"
              rows={15}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Odustani
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Spremam..." : isEdit ? "Ažuriraj" : "Spremi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}