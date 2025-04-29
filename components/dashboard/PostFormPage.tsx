"use client";

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

const handleGenerateFullPost = async () => {
  console.log("Kliknjen gumb za generacijo!");
  if (!f.title) {
    toast.warning("Najprej vnesi naslov posta");
    return;
  }

  try {
    f.setLoading(true);
    const sections = await regenerateFullPostContent(f.title);

    if (!sections || sections.length === 0) {
      toast.error("Generacija ni uspela (prazno)");
      return;
    }

    // Če želiš, da vedno začne s prazno sekcijo:
    f.clearSections?.();

    let usedSections = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      // Če sekcija nima headinga ali contenta → preskoči
      if (!section.title?.trim() || !section.content?.trim()) {
        continue;
      }

      let index;
      if (usedSections === 0 && f.sections.length > 0) {
        index = 0; // Uporabi obstoječo sekcijo
      } else {
        index = f.addSection(); // Doda novo sekcijo
      }

      f.updateSection(index, "heading", section.title);
      f.updateSection(index, "content", section.content);
      usedSections++;
    }

    // Če Gemini vrne manj kot 3 uporabne sekcije:
    if (usedSections < 3) {
      toast.warning(`AI je ustvaril samo ${usedSections} sekcije. Poskusi ponovno.`);
    } else {
      toast.success("Celoten post uspešno generiran!");
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kategorija */}
            <div className="flex flex-col gap-2">
              <Label className="text-md font-semibold">Kategorija</Label>
              <Select value={f.categoryId} onValueChange={f.setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberi kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {f.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Objavljen */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="published-switch" className="text-md font-semibold">
                Objavljen
              </Label>
              <Switch
                checked={f.published}
                onCheckedChange={f.setPublished}
                id="published-switch"
              />
            </div>

            {/* Naslov */}
            <div className="flex flex-col gap-2">
              <Label className="text-md font-semibold">Naslov</Label>
              <Input
                value={f.title}
                onChange={(e) => f.setTitle(e.target.value)}
                placeholder="Unesi naslov posta"
              />
            </div>

            {/* Naslovna slika */}
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