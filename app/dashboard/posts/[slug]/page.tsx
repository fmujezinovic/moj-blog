"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input }  from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label }  from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import { usePostForm }      from "@/hooks/usePostForm";
import CoverImageSelector   from "@/components/post/CoverImageSelector";
import PostSectionEditor    from "@/components/post/PostSectionEditor";

export default function CreateOrEditPostPage() {
  const f = usePostForm();

  return (
    <main className="flex justify-center px-4 py-10">
      <Card className="w-full max-w-6xl p-8">
        {/* ---------- HEADER ---------- */}
        <CardHeader className="space-y-6">
          <CardTitle className="text-3xl font-bold">
            {f.isEdit ? "Uredi Post" : "Kreiraj Novi Post"}
          </CardTitle>

          {/* TITLE + CATEGORY */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Title */}
            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Naslov</Label>
              <Input
                value={f.title}
                onChange={e => f.setTitle(e.target.value)}
                placeholder="Unesi naslov posta"
              />
            </div>
            {/* Category */}
            <div className="flex-1 flex flex-col gap-2">
              <Label className="text-md font-semibold">Kategorija</Label>
              <Select value={f.categoryId} onValueChange={f.setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Izberi kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {f.categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* COVER */}
          <CoverImageSelector current={f.images[0]} onSelect={f.setCoverImage} />

          {/* PUBLISHED */}
          <div className="flex items-center gap-3 mt-6">
            <Switch
              checked={f.published}
              onCheckedChange={f.setPublished}
              id="published-switch"
            />
            <Label htmlFor="published-switch" className="text-md font-semibold">
              Objavljen
            </Label>
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
              {f.isEdit ? "Posodobi Post" : "Spremi Post"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
