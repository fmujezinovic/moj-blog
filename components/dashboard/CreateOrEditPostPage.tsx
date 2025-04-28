"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import SectionRegenerator from "@/components/dashboard/SectionRegenerator";

/* -------------------------------------------------------------------------- */
/*                               HELPER FUNCS                                 */
/* -------------------------------------------------------------------------- */

// Extracts sections (h2 + body) from markdown
const parseMarkdownToSections = (markdown: string) => {
  if (!markdown?.trim()) return [];
  const regex = /^##\s+(.*?)[\r\n]+([\s\S]*?)(?=^##\s+|$)/gm;
  const sections: { heading: string; content: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    const [, heading, content] = match;
    sections.push({ heading: heading.trim(), content: content.trim() });
  }
  return sections;
};

// Converts UI sections back to markdown for DB storage
const stringifySectionsToMarkdown = (sections: { heading: string; content: string }[]) =>
  sections
    .filter((s) => s.heading.trim() && s.content.trim())
    .map((s) => `## ${s.heading}\n\n${s.content.trim()}`)
    .join("\n\n");

// Attaches images from the `images` array where index 0 is cover, the rest per section order
const attachSectionImages = (
  sections: { heading: string; content: string }[],
  images: string[],
) =>
  sections.map((s, idx) => ({
    ...s,
    imageUrl: images[idx + 1] || "",
    uploadedImagePath: null as string | null,
  }));

/* -------------------------------------------------------------------------- */
/*                               REACT PAGE                                   */
/* -------------------------------------------------------------------------- */
export default function CreateOrEditPostPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string | undefined;

  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [sections, setSections] = useState<
    { heading: string; content: string; imageUrl: string; uploadedImagePath: string | null }[]
  >([{ heading: "", content: "", imageUrl: "", uploadedImagePath: null }]);
  const [selectedTab, setSelectedTab] = useState("0");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]); // [cover, s1, s2, ...]
  const [coverUploadedPath, setCoverUploadedPath] = useState<string | null>(null);

  const isEditMode = Boolean(slugParam);

  /* ------------------------------- FETCHING -------------------------------- */
  useEffect(() => {
    (async () => {
      await fetchCategories();
      if (isEditMode) await fetchPostData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugParam]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("id, name");
    if (error) {
      console.error(error);
      toast.error("Napaka pri nalaganju kategorij");
      return;
    }
    setCategories(data || []);
  };

  const fetchPostData = async () => {
    const { data, error } = await supabase.from("posts").select("*").eq("slug", slugParam).single();
    if (error || !data) {
      toast.error("Napaka pri nalaganju podatkov");
      router.push("/dashboard/posts");
      return;
    }

    setTitle(data.title);
    setPublished(!data.is_draft);
    setCategoryId(data.category_id);
    setImages(data.images || []);

    // Parse markdown and attach corresponding images
    const basicSections = parseMarkdownToSections(data.content_md || "");
    const enrichedSections = attachSectionImages(basicSections, data.images || []);

    setSections(enrichedSections.length ? enrichedSections : [{ heading: "", content: "", imageUrl: "", uploadedImagePath: null }]);
    setSelectedTab("0");
  };

  /* ---------------------------- SECTION MGMT ------------------------------- */
  const handleAddSection = () => {
    setSections((prev) => [...prev, { heading: "", content: "", imageUrl: "", uploadedImagePath: null }]);
    // ensure images array has placeholder for new section
    setImages((prev) => [...prev, ""]);
    setSelectedTab(String(sections.length));
  };

  const handleSectionChange = (
    index: number,
    field: "heading" | "content",
    value: string,
  ) =>
    setSections((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });

  const handleSectionImageUpload = async (index: number, url: string) => {
    const oldPath = sections[index].uploadedImagePath;
    if (oldPath) {
      const { error } = await supabase.storage.from("images").remove([oldPath]);
      if (error) console.error("Napaka pri brisanju slike:", error.message);
    }

    // update UI section
    setSections((prev) => {
      const updated = [...prev];
      updated[index].imageUrl = url;
      updated[index].uploadedImagePath = null;
      return updated;
    });

    // place image at correct position in images array (index+1)
    setImages((prev) => {
      const updated = [...prev];
      updated[index + 1] = url; // +1 because 0 is cover
      return updated;
    });
  };

  /* --------------------------- COVER IMAGE --------------------------------- */
  const handleCoverImageUpload = async (url: string) => {
    if (coverUploadedPath) {
      const { error } = await supabase.storage.from("images").remove([coverUploadedPath]);
      if (error) console.error("Napaka pri brisanju slike:", error.message);
    }
    setImages((prev) => {
      const updated = [...prev];
      updated[0] = url;
      return updated;
    });
    setCoverUploadedPath(null);
  };

  /* ---------------------------- DELETE SECTION ----------------------------- */
  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      toast.error("Mora obstajati vsaj ena sekcija!");
      return;
    }
    if (confirm("Ali si prepričan, da želiš izbrisati to sekcijo?")) {
      setSections((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== index + 1)); // remove its image slot
      setSelectedTab("0");
    }
  };

  /* ------------------------------- SAVE ------------------------------------ */
  const handleSave = async () => {
    if (!title.trim() || !categoryId) {
      toast.error("Naslov in kategorija sta obvezna!");
      return;
    }
    if (!sections.some((s) => s.heading.trim() && s.content.trim())) {
      toast.error("Vsaj ena sekcija mora biti izpolnjena!");
      return;
    }

    setLoading(true);
    try {
      const content_md = stringifySectionsToMarkdown(sections);
      if (isEditMode) {
        const { error } = await supabase
          .from("posts")
          .update({ title, content_md, is_draft: !published, category_id: categoryId, images })
          .eq("slug", slugParam);
        if (error) throw error;
        toast.success("Post uspešno posodobljen!");
      } else {
        const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const { error } = await supabase.from("posts").insert({
          title,
          slug: newSlug,
          content_md,
          is_draft: !published,
          category_id: categoryId,
          images,
        });
        if (error) throw error;
        toast.success("Post uspešno kreiran!");
      }
      router.push("/dashboard/posts");
    } catch (err) {
      console.error(err);
      toast.error("Napaka pri shranjevanju posta.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- RENDER -------------------------------- */
  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-6xl p-8">
        <CardHeader className="space-y-6">
          <CardTitle className="text-3xl font-bold">{isEditMode ? "Uredi Post" : "Kreiraj Novi Post"}</CardTitle>

          {/* TITLE & CATEGORY */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Naslov</Label>
              <Input placeholder="Unesi naslov posta" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Kategorija</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberi kategorijo" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className="flex flex-col gap-4 mt-6">
            <Label className="text-md font-semibold">Naslovna slika</Label>
            <UploadImageButton currentUploadedPath={coverUploadedPath} onUploaded={handleCoverImageUpload} />
            <div className="flex gap-4 mt-2">
              <SelectUnsplashImageDialog onSelect={handleCoverImageUpload} />
              <SelectPexelsImageDialog onSelect={handleCoverImageUpload} />
            </div>
            {images[0] && <img src={images[0]} alt="Cover" className="mt-4 rounded-md max-h-64 object-cover" />}
          </div>

          {/* PUBLISHED SWITCH */}
          <div className="flex items-center gap-3 mt-6">
            <Switch checked={published} onCheckedChange={setPublished} id="published-switch" />
            <Label htmlFor="published-switch" className="text-md font-semibold">
              Objavljen
            </Label>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          {/* ---------------- SECTIONS TABS ---------------- */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="flex flex-wrap gap-2 bg-muted p-2 rounded-md">
                {sections.map((_, idx) => (
                  <TabsTrigger
                    key={idx}
                    value={String(idx)}
                    className="min-w-36 data-[state=active]:bg-primary data-[state=active]:text-white bg-muted text-muted-foreground rounded-md px-4 py-2 transition-all hover:bg-primary/10"
                  >
                    Sekcija {idx + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSection}>
                Dodaj sekcijo
              </Button>
            </div>

            {sections.map((section, index) => (
              <TabsContent
                key={index}
                value={String(index)}
                className="space-y-6 bg-muted/50 p-6 rounded-md shadow-sm"
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="flex flex-col gap-6">
                    {/* HEADING */}
                    <div>
                      <Label className="text-md font-semibold">Podnaslov</Label>
                      <Input
                        placeholder="Unesi podnaslov"
                        value={section.heading}
                        onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-md font-semibold">Vsebina</Label>
                      <Textarea
                        placeholder="Unesi vsebino sekcije"
                        rows={8}
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                      />
                    </div>

                    {/* IMAGE */}
                    <div className="flex flex-col gap-4">
                      <Label className="text-md font-semibold">Slika sekcije</Label>
                      <UploadImageButton
                        currentUploadedPath={section.uploadedImagePath}
                        onUploaded={(url) => handleSectionImageUpload(index, url)}
                      />
                      <div className="flex gap-4">
                        <SelectUnsplashImageDialog onSelect={(url) => handleSectionImageUpload(index, url)} />
                        <SelectPexelsImageDialog onSelect={(url) => handleSectionImageUpload(index, url)} />
                      </div>
                      {section.imageUrl && (
                        <img
                          src={section.imageUrl}
                          alt={`Sekcija ${index + 1}`}
                          className="mt-4 rounded-md max-h-48 object-cover"
                        />
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 mt-4">
                      <SectionRegenerator
                        sectionTitle={section.heading}
                        onRegenerate={(newContent) => handleSectionChange(index, "content", newContent)}
                      />
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteSection(index)}>
                        Izbriši sekcijo
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>

          {/* SAVE / CANCEL */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/posts")}
            >
              Prekliči
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {isEditMode ? "Posodobi Post" : "Spremi Post"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
