"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import UploadImageButton from "@/components/UploadImageButton";
import { SelectUnsplashImageDialog } from "@/components/SelectUnsplashImageDialog";
import { SelectPexelsImageDialog } from "@/components/SelectPexelsImageDialog";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import SectionRegenerator from "@/components/dashboard/SectionRegenerator";

export default function CreateOrEditPostPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const slugParam = params.slug as string | undefined;

  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [sections, setSections] = useState([{ heading: "", content: "", imageUrl: "" }]);
  const [selectedTab, setSelectedTab] = useState("0");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [openNewCategory, setOpenNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const isEditMode = !!slugParam;

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchPostData();
    }
  }, [isEditMode]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("id, name");
    if (error) {
      console.error(error);
    } else {
      setCategories(data || []);
    }
  };

  const fetchPostData = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slugParam)
      .single();

    if (error || !data) {
      toast.error("Napaka pri nalaganju podatkov");
      router.push("/dashboard/posts");
      return;
    }

    setTitle(data.title);
    setPublished(!data.is_draft);
    setCategoryId(data.category_id);
    setImages(data.images || []);

    const parsedSections = data.content_md
      .split(/\n\n## /)
      .map((block: string, index: number) => {
        const lines = block.split("\n\n");
        const heading = index === 0 ? lines[0].replace("## ", "") : lines[0];
        const content = lines.slice(1).join("\n\n");
        return { heading, content, imageUrl: "" };
      });

    setSections(parsedSections);
  };

  const handleAddSection = () => {
    setSections((prev) => [...prev, { heading: "", content: "", imageUrl: "" }]);
    setSelectedTab((sections.length).toString());
  };

  const handleSectionChange = (index: number, field: "heading" | "content", value: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSectionImageUpload = (index: number, url: string) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index].imageUrl = url;
      return updated;
    });
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) {
      toast.error("Mora obstajati vsaj ena sekcija!");
      return;
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
    setSelectedTab("0");
  };

  const handleSave = async () => {
    if (!title.trim() || !categoryId) {
      toast.error("Naslov in kategorija sta obvezna!");
      return;
    }

    const hasValidSections = sections.some((s) => s.heading.trim() && s.content.trim());
    if (!hasValidSections) {
      toast.error("Vsaj ena sekcija mora biti izpolnjena!");
      return;
    }

    setLoading(true);

    try {
      const content_md = sections
        .map((s) => `## ${s.heading}\n\n${s.content}`)
        .join("\n\n");

      if (isEditMode) {
        const { error } = await supabase
          .from("posts")
          .update({
            title,
            content_md,
            is_draft: !published,
            category_id: categoryId,
            images: images,
          })
          .eq("slug", slugParam);

        if (error) throw error;

        toast.success("Post uspešno posodobljen!");
      } else {
        const newSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        const { error } = await supabase
          .from("posts")
          .insert({
            title,
            slug: newSlug,
            content_md,
            is_draft: !published,
            category_id: categoryId,
            images: images,
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

  const handleCancel = () => {
    router.push("/dashboard/posts");
  };

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-6xl p-8">
        <CardHeader className="space-y-6">
          <CardTitle className="text-3xl font-bold">{isEditMode ? "Uredi Post" : "Kreiraj Novi Post"}</CardTitle>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Naslov</Label>
              <Input
                placeholder="Unesi naslov posta"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Kategorija</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberi kategorijo" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <Label className="text-md font-semibold">Naslovna slika</Label>
            <UploadImageButton
              currentUploadedPath={null}
              onUploaded={(url) => {
                const updatedImages = [...images];
                updatedImages[0] = url;
                setImages(updatedImages);
              }}
            />
            {images[0] && (
              <img src={images[0]} alt="Cover" className="mt-2 rounded-md max-h-64 object-cover" />
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              id="published-switch"
            />
            <Label htmlFor="published-switch" className="text-md font-semibold">Objavljen</Label>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="flex flex-wrap gap-2 bg-muted p-2 rounded-md">
                {sections.map((_, idx) => (
                  <TabsTrigger
                    key={idx}
                    value={idx.toString()}
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
                value={index.toString()}
                className="space-y-6 bg-muted/50 p-6 rounded-md shadow-sm"
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="flex flex-col gap-6">

                    <div>
                      <Label className="text-md font-semibold">Podnaslov</Label>
                      <Input
                        placeholder="Unesi podnaslov"
                        value={section.heading}
                        onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-md font-semibold">Vsebina</Label>
                      <Textarea
                        placeholder="Unesi vsebino sekcije"
                        rows={8}
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <Label className="text-md font-semibold">Slika sekcije</Label>
                      <UploadImageButton
                        currentUploadedPath={null}
                        onUploaded={(url) => handleSectionImageUpload(index, url)}
                      />
                      <div className="flex gap-4">
                        <SelectUnsplashImageDialog
                          onSelect={(url) => handleSectionImageUpload(index, url)}
                        />
                        <SelectPexelsImageDialog
                          onSelect={(url) => handleSectionImageUpload(index, url)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <SectionRegenerator
                        sectionTitle={section.heading}
                        onRegenerate={(newContent) => handleSectionChange(index, "content", newContent)}
                      />
                      {sections.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="bg-destructive text-black hover:bg-destructive/80"
                          onClick={() => {
                            if (confirm("Ali si prepričan, da želiš izbrisati to sekcijo?")) {
                              handleDeleteSection(index);
                            }
                          }}
                        >
                          Izbriši sekcijo
                        </Button>
                      )}
                    </div>

                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
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
