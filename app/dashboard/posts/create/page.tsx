"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SectionRegenerator from "@/components/dashboard/SectionRegenerator";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function CreatePostPage() {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([{ heading: "", content: "", imageUrl: "" }]);

  const handleAddSection = () => {
    setSections((prev) => [...prev, { heading: "", content: "", imageUrl: "" }]);
  };

  const handleSectionChange = (index: number, field: "heading" | "content", value: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSectionImageChange = (index: number, url: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index].imageUrl = url;
      return updated;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Naslov je obavezan");
      return;
    }

    try {
      const content_md = sections
        .map((s) => {
          const imgPart = s.imageUrl ? `![Image](${s.imageUrl})\n\n` : "";
          return `# ${s.heading}\n\n${imgPart}${s.content}`;
        })
        .join("\n\n");

      const { error } = await supabase.from("posts").insert({
        title,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        content_md,
        is_draft: true,
      });

      if (error) throw error;

      toast.success("Post kreiran!");
      window.location.href = "/dashboard/posts";
    } catch (err) {
      console.error(err);
      toast.error("Greška pri kreiranju posta");
    }
  };

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Kreiraj Novi Post</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Naslov</Label>
            <Input
              placeholder="Unesi naslov posta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <Separator />

          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <Label>Podnaslov {index + 1}</Label>
              <Input
                placeholder="Unesi podnaslov"
                value={section.heading}
                onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
              />
              <Textarea
                placeholder="Unesi sadržaj za ovaj podnaslov"
                rows={5}
                value={section.content}
                onChange={(e) => handleSectionChange(index, "content", e.target.value)}
              />

              <SectionRegenerator
                sectionTitle={section.heading}
                onRegenerate={(newContent) => handleSectionChange(index, "content", newContent)}
              />

              <div className="space-y-2">
                <Label>Slika za sekciju</Label>

                <UploadImageButton onUpload={(url) => handleSectionImageChange(index, url)} />

                <div className="flex gap-2 mt-2">
                  <SelectUnsplashImageDialog onSelect={(url) => handleSectionImageChange(index, url)} />
                  <SelectPexelsImageDialog onSelect={(url) => handleSectionImageChange(index, url)} />
                </div>

                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt="Predogled slike"
                    className="w-32 h-32 object-cover rounded-md mt-2"
                  />
                )}
              </div>

              <Separator />
            </div>
          ))}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={handleAddSection}>
              Dodaj Podnaslov
            </Button>
            <Button onClick={handleSave}>
              Spremi Post
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
