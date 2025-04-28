"use client";

import { useState } from "react";



import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { regenerateSectionContent } from "@/lib/gemini";

interface SectionRegeneratorProps {
  sectionTitle: string;
  onRegenerate: (newContent: string) => void;
}

export default function SectionRegenerator({ sectionTitle, onRegenerate }: SectionRegeneratorProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const newContent = await regenerateSectionContent(sectionTitle, note);
      onRegenerate(newContent);
      toast.success("Sekcija uspješno regenerirana!");
      setOpen(false);
      setNote("");
    } catch (error) {
      console.error(error);
      toast.error("Greška pri regeneraciji sekcije");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Regeneriraj
        </Button>
      </DialogTrigger>

          <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle>Regeneriraj sekciju</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kako želiš da AI poboljša sekciju: <strong>{sectionTitle}</strong>?
          </p>
          <Textarea
            placeholder="Npr. Napiši u stilu blog posta za početnike..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleRegenerate} disabled={loading}>
            {loading ? "Generiranje..." : "Generiraj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
