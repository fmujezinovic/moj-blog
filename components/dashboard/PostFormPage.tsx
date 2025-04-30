"use client";

import { useState, useEffect, useTransition } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
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
import {
  regenerateFullPostContent,
  generateMetaDescription,
  regenerateSectionContent,
} from "@/lib/gemini";
import { usePostForm } from "@/hooks/usePostForm";
import CoverImageSelector from "@/components/post/CoverImageSelector";
import PostSectionEditor from "@/components/post/PostSectionEditor";

interface PostFormPageProps {
  isEdit?: boolean;
}

export default function PostFormPage({ isEdit = false }: PostFormPageProps) {
  const f = usePostForm();
  const [publishDate, setPublishDate] = useState<Date | null>(null);
  const [isPendingDesc, startDesc] = useTransition();
  const [isPendingFull, startFull] = useTransition();
  const [isPendingIntro, startIntro] = useTransition();
  const [isPendingConclusion, startConclusion] = useTransition();

  const [showFullModal, setShowFullModal] = useState(false);
  const [fullNote, setFullNote] = useState("");

  useEffect(() => {
    if (f.publishDate) {
      setPublishDate(new Date(f.publishDate));
    }
  }, [f.publishDate]);

  const handleGenerateFullPost = () => {
    if (!f.title.trim()) {
      toast.warning("Najprej vnesi naslov posta");
      return;
    }
    setFullNote("");
    setShowFullModal(true);
  };

  const generateFull = () => {
    setShowFullModal(false);
    startFull(async () => {
      try {
        f.setLoading(true);

        // 1) sekcije
        const sections = await regenerateFullPostContent(f.title, fullNote);
        if (!sections.length) {
          toast.error("Gemini ni vrnil nobene sekcije.");
          return;
        }
        f.setSections(
          sections.map((sec) => ({
            heading: sec.heading,
            content: sec.content,
            imageUrl: "",
            uploadedImagePath: null,
          }))
        );
        f.setSelectedTab("0");

        // build markdown for next steps
        const markdown = sections
          .map((s) => `## ${s.heading}\n${s.content}`)
          .join("\n\n");

        // 2) meta opis
        const desc = await generateMetaDescription(f.title, markdown);
        f.setDescription(desc);

        // 3) uvod
        const intro = await regenerateSectionContent(
          "Uvod",
          `Na osnovi naslova "${f.title}" in naslednjih sekcij:\n\n${markdown}`
        );
        f.setIntro(intro.trim());

        // 4) zaključek
        const conclusion = await regenerateSectionContent(
          "Zaključek",
          `Na osnovi naslova "${f.title}" in naslednjih sekcij:\n\n${markdown}`
        );
        f.setConclusion(conclusion.trim());

        toast.success("Celoten post, meta opis, uvod in zaključek uspešno ustvarjeni!");
      } catch (error) {
        console.error(error);
        toast.error("Napaka pri generiranju vsebine");
      } finally {
        f.setLoading(false);
      }
    });
  };

  const handleGenerateDescription = () => {
    if (!f.title.trim()) {
      toast.warning("Najprej vnesi naslov posta");
      return;
    }
    startDesc(async () => {
      try {
        const markdown = f.sections
          .map((s) => `## ${s.heading}\n${s.content}`)
          .join("\n\n");
        const desc = await generateMetaDescription(f.title, markdown);
        f.setDescription(desc);
        toast.success("Meta opis ustvarjen!");
      } catch (e) {
        console.error(e);
        toast.error("Napaka pri generiranju opisa");
      }
    });
  };

  const handleGenerateIntro = () => {
    if (!f.title.trim()) {
      toast.warning("Najprej vnesi naslov posta");
      return;
    }
    startIntro(async () => {
      try {
        const markdown = f.sections
          .map((s) => `## ${s.heading}\n${s.content}`)
          .join("\n\n");
        const intro = await regenerateSectionContent(
          "Uvod",
          `Na osnovi naslova "${f.title}" in naslednjih sekcij:\n\n${markdown}`
        );
        f.setIntro(intro.trim());
        toast.success("Uvod ustvarjen!");
      } catch (e) {
        console.error(e);
        toast.error("Napaka pri generiranju uvoda");
      }
    });
  };

  const handleGenerateConclusion = () => {
    if (!f.title.trim()) {
      toast.warning("Najprej vnesi naslov posta");
      return;
    }
    startConclusion(async () => {
      try {
        const markdown = f.sections
          .map((s) => `## ${s.heading}\n${s.content}`)
          .join("\n\n");
        const conclusion = await regenerateSectionContent(
          "Zaključek",
          `Na osnovi naslova "${f.title}" in naslednjih sekcij:\n\n${markdown}`
        );
        f.setConclusion(conclusion.trim());
        toast.success("Zaključek ustvarjen!");
      } catch (e) {
        console.error(e);
        toast.error("Napaka pri generiranju zaključka");
      }
    });
  };

  return (
    <>
      <main className="flex justify-center px-4 py-10">
        <Card className="w-full max-w-6xl p-8">
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
                  disabled={f.loading || isPendingFull}
                >
                  {f.loading || isPendingFull ? (
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

            <div className="flex flex-wrap items-end gap-6">
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

              <div className="flex flex-col gap-6 w-40">
                <Label className="text-md font-semibold">Objavljen</Label>
                <Switch
                  checked={f.published}
                  onCheckedChange={f.setPublished}
                  id="published-switch"
                />
              </div>

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

            <div className="mt-6 flex flex-col gap-2">
              <Label className="text-md font-semibold">Naslov</Label>
              <Input
                value={f.title}
                onChange={(e) => f.setTitle(e.target.value)}
                placeholder="Unesi naslov posta"
              />
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Label className="text-md font-semibold" htmlFor="description">
                Opis (meta description)
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  value={f.description}
                  onChange={(e) => f.setDescription(e.target.value)}
                  placeholder="Kratek opis za SEO (priporočeno do 160 znakov)"
                  rows={3}
                  className={
                    f.description.length > 160 || !f.description.trim()
                      ? "border-red-500"
                      : ""
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isPendingDesc}
                >
                  {isPendingDesc ? "Generiram…" : "AI napiši opis"}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                <span
                  className={
                    f.description.length > 160 || !f.description.trim()
                      ? "text-red-500 font-medium"
                      : ""
                  }
                >
                  {f.description.length} / 160
                </span>
              </div>
            </div>

            <div className="mt-6">
              <CoverImageSelector current={f.images[0]} onSelect={f.setCoverImage} />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-8">
            <div className="mt-6 flex flex-col gap-2">
              <Label htmlFor="intro" className="text-md font-semibold">
                Uvod
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="intro"
                  value={f.intro}
                  onChange={(e) => f.setIntro(e.target.value)}
                  placeholder="Napiši uvod, ki bo pred sekcijami"
                  rows={4}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateIntro}
                  disabled={isPendingIntro}
                >
                  {isPendingIntro ? "Generiram…" : "AI napiši uvod"}
                </Button>
              </div>
            </div>

            <Tabs value={f.selectedTab} onValueChange={f.setSelectedTab}>
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

            <div className="mt-6 flex flex-col gap-2">
              <Label htmlFor="conclusion" className="text-md font-semibold">
                Zaključek
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="conclusion"
                  value={f.conclusion}
                  onChange={(e) => f.setConclusion(e.target.value)}
                  placeholder="Napiši zaključek, ki bo po sekcijah"
                  rows={4}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateConclusion}
                  disabled={isPendingConclusion}
                >
                  {isPendingConclusion ? "Generiram…" : "AI napiši zaključek"}
                </Button>
              </div>
            </div>

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

      {showFullModal && (
        <Modal onClose={() => setShowFullModal(false)} title="Dodatna navodila za AI">
          <Textarea
            rows={4}
            placeholder="Npr. 'Dodaj praktične primere' ali 'Vključi statistiko'"
            value={fullNote}
            onChange={(e) => setFullNote(e.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFullModal(false)}>
              Prekliči
            </Button>
            <Button onClick={generateFull}>Generiraj</Button>
          </div>
        </Modal>
      )}
    </>
  );
}
