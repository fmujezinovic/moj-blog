"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import { regenerateFullPostContent } from "@/lib/gemini";
import { usePostForm } from "@/hooks/usePostForm";
import CoverImageSelector from "@/components/post/CoverImageSelector";
import PostSectionEditor from "@/components/post/PostSectionEditor";

interface PostFormPageProps {
  isEdit?: boolean;
}

export default function PostFormPage({ isEdit = false }: PostFormPageProps) {
  const f = usePostForm();
  const [publishDate, setPublishDate] = useState<Date | null>(null);

useEffect(() => {
  if (f.publishDate) {
    setPublishDate(new Date(f.publishDate));
  }
}, [f.publishDate]);


  const handleGenerateFullPost = async () => {
    if (!f.title) {
      toast.warning("Najprej vnesi naslov posta");
      return;
    }

    try {
      f.setLoading(true);
      const sections = await regenerateFullPostContent(f.title);
      if (!sections.length) {
        toast.error("Gemini ni vrnil nobene sekcije.");
        return;
      }

      f.setSections(
        sections.map(sec => ({
          heading: sec.heading,
          content: sec.content,
          imageUrl: "",
          uploadedImagePath: null,
        }))
      );
      f.setSelectedTab("0");
      toast.success("Celoten post uspešno generiran!");
    } catch (error) {
      console.error(error);
      toast.error("Napaka pri generiranju vsebine");
    } finally {
      f.setLoading(false);
    }
  };

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-6xl p-8">
        {/* ---------- HEADER ---------- */}
        <CardHeader className="space-y-6 border border-[hsl(var(--card-border))] shadow-sm rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-3xl font-bold">
              {isEdit ? "Uredi Post" : "Kreiraj Novi Post"}
            </CardTitle>
            {!isEdit && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateFullPost}
                disabled={f.loading}
              >
                {f.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white" />
                    Generiram...
                  </div>
                ) : (
                  "Generiraj celoten post"
                )}
              </Button>
            )}
          </div>

          {/* FORM GRID */}
          <div className="flex flex-wrap items-end gap-6">
            {/* Kategorija */}
            <div className="flex flex-col gap-2 w-64">
              <Label className="text-md font-semibold">Kategorija</Label>
              <Select value={f.categoryId} onValueChange={f.setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberi kategoriju" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {f.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Objavljen */}
            <div className="flex flex-col gap-6 w-40">
              <Label className="text-md font-semibold">Objavljen</Label>
              <Switch
                checked={f.published}
                onCheckedChange={f.setPublished}
                id="published-switch"
              />
            </div>

            {/* Datum i ura objave */}
            <div className="flex flex-col gap-2 w-64">
              <Label htmlFor="published-date" className="text-md font-semibold">
                Datum i ura objave
              </Label>
              <DatePicker
                id="published-date"
                selected={publishDate}
                onChange={(date) => {
                  setPublishDate(date);
                  if (date) f.setPublishDate(date.toISOString());
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd.MM.yyyy HH:mm"
                placeholderText="Izberi datum in uro objave"
                className="border rounded-md px-3 py-2 text-sm text-muted-foreground"
              />
            </div>
          </div>

          {/* Naslov */}
          <div className="mt-6 flex flex-col gap-2">
            <Label className="text-md font-semibold">Naslov</Label>
            <Input
              value={f.title}
              onChange={(e) => f.setTitle(e.target.value)}
              placeholder="Unesi naslov posta"
            />
                  </div>
                  
{/* Opis (description) z omejitvijo in števcem */}
<div className="mt-6 flex flex-col gap-2">
  <Label className="text-md font-semibold" htmlFor="description">
    Opis (meta description)
  </Label>
  <Textarea
    id="description"
    value={f.description}
    onChange={(e) => f.setDescription(e.target.value)}
    placeholder="Kratek opis za SEO (priporočeno do 160 znakov)"
    rows={3}
    className={f.description.length > 160 || !f.description.trim() ? "border-red-500" : ""}
  />
  <div className="text-sm text-muted-foreground text-right">
    <span className={
      f.description.length > 160 || !f.description.trim()
        ? "text-red-500 font-medium"
        : ""
    }>
      {f.description.length} / 160
    </span>
  </div>
</div>




          {/* Naslovna slika */}
          <div className="mt-6">
            <CoverImageSelector
              current={f.images[0]}
              onSelect={f.setCoverImage}
            />
          </div>
        </CardHeader>

        {/* ---------- CONTENT ---------- */}
        <CardContent className="flex flex-col gap-8">
          <Tabs value={f.selectedTab} onValueChange={f.setSelectedTab}>
            {/* Tab triggers */}
            <div className="flex items-center justify-between mb-6">
              <TabsList className="flex flex-wrap gap-2 bg-muted p-2 rounded-md">
                {f.sections.map((_, i) => (
                  <TabsTrigger
                    key={i}
                    value={String(i)}
                    className="min-w-36 data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Sekcija {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button variant="outline" size="sm" onClick={f.addSection}>
                Dodaj sekcijo
              </Button>
            </div>

            {/* Tab contents */}
            {f.sections.map((s, i) => (
              <TabsContent key={i} value={String(i)}>
                <PostSectionEditor
                  idx={i}
                  section={s}
                  onChange={f.updateSection}
                  onImage={f.setSectionImage}
                  onDelete={f.deleteSection}
                />
              </TabsContent>
            ))}
          </Tabs>

          {/* SAVE / CANCEL */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => history.back()}>
              Prekliči
            </Button>
            <Button onClick={f.save} disabled={f.loading}>
              {isEdit ? "Posodobi Post" : "Spremi Post"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
