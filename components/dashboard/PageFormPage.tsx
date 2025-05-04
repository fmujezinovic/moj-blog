"use client";

import { useState, useTransition, useEffect } from "react";
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

import CoverImageSelector from "@/components/post/CoverImageSelector";
import MultipleImageSelector from "@/components/post/MultipleImageSelector";
import { regenerateFullPostContent, generateMetaDescription } from "@/lib/gemini";

import type { ImageRef } from "@/types/image";

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
    cover_image_url: string | null;
    images_urls: string[] | null;
  };
}

export default function PageFormPage({ isEdit = false, initialData }: PageFormPageProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [content, setContent] = useState(initialData?.content_md ?? "");
  const [isDraft, setIsDraft] = useState(initialData?.is_draft ?? true);
  const [publishDate, setPublishDate] = useState<Date | null>(
    initialData?.published_at ? new Date(initialData.published_at) : null
  );

  const [coverImage, setCoverImage] = useState<ImageRef | undefined>(
    initialData?.cover_image_url ? { url: initialData.cover_image_url, path: null } : undefined
  );

  const [images, setImages] = useState<ImageRef[]>(
    initialData?.images_urls?.map((url) => ({ url, path: null })) ?? []
  );

  const [loading, setLoading] = useState(false);
  const [isPendingAI, startAI] = useTransition();

  useEffect(() => {
    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(newSlug);
  }, [title]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Naslov je obvezen.");
      return;
    }

    if (description.length > 160) {
      toast.error("Meta opis naj bo krajši od 160 znakov.");
      return;
    }

    const pageData = {
      title,
      slug,
      content_md: content,
      description,
      is_draft: isDraft,
      published_at: publishDate?.toISOString() ?? null,
      cover_image_url: coverImage?.url ?? null,
      images_urls: images.map((img) => img.url),
    };

    try {
      setLoading(true);
      if (isEdit && initialData) {
        const { error } = await supabase.from("pages").update(pageData).eq("id", initialData.id);
        if (error) throw error;
        toast.success("Stran posodobljena.");
      } else {
        const { error } = await supabase.from("pages").insert([pageData]);
        if (error) throw error;
        toast.success("Stran ustvarjena.");
      }
      router.push("/dashboard/pages");
    } catch (err) {
      console.error(err);
      toast.error("Napaka pri shranjevanju.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!title.trim()) {
      toast.warning("Najprej vnesi naslov.");
      return;
    }

    startAI(async () => {
      try {
        setLoading(true);
        const sections = await regenerateFullPostContent(title);
        const markdown = sections.map((s) => `## ${s.heading}\n${s.content}`).join("\n\n");
        setContent(markdown);

        const meta = await generateMetaDescription(title, markdown);
        setDescription(meta);
        toast.success("Vsebina uspešno generirana.");
      } catch (e) {
        console.error(e);
        toast.error("Napaka pri AI generaciji.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-6">
          <CardTitle className="text-3xl font-bold">
            {isEdit ? "Uredi stran" : "Nova stran"}
          </CardTitle>

          <div className="flex flex-col gap-2">
            <Label>Naslov</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Slug</Label>
            <Input value={slug} readOnly disabled className="opacity-50 cursor-not-allowed" />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Meta opis (SEO)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={description.length > 160 ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-sm">
              <span className={description.length > 160 ? "text-red-500" : "text-muted-foreground"}>
                {description.length} / 160
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!title.trim() || !content.trim()) {
                    toast.error("Za meta opis je potreben naslov in vsebina.");
                    return;
                  }
                  const meta = await generateMetaDescription(title, content);
                  setDescription(meta);
                  toast.success("Meta opis generiran.");
                }}
              >
                AI: Meta opis
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-3">
              <Switch checked={!isDraft} onCheckedChange={(val) => setIsDraft(!val)} id="draft" />
              <Label htmlFor="draft">Objavljeno</Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Datum objave</Label>
              <DatePicker
                selected={publishDate}
                onChange={(date) => setPublishDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                className="border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CoverImageSelector current={coverImage} onSelect={setCoverImage} />
          <MultipleImageSelector images={images} onChange={setImages} />

          <div className="flex flex-col gap-2">
            <Label>Vsebina (Markdown)</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              placeholder="## Naslov sekcije\nBesedilo ..."
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isPendingAI || loading}
            >
              {isPendingAI ? "Generiram..." : "AI: Generiraj vsebino"}
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => router.back()}>
                Prekliči
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Shranjujem..." : isEdit ? "Shrani spremembe" : "Ustvari"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
