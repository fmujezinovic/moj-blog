// components/dashboard/PostFormPage.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
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
        f.setLoading(true);  // now works!

        // 1) sekcije
        const sections = await regenerateFullPostContent(f.title, fullNote);
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

        const markdown = sections.map(s => `## ${s.heading}\n${s.content}`).join("\n\n");

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

        toast.success("Vsebina uspešno generirana!");
      } catch (error) {
        console.error(error);
        toast.error("Napaka pri generiranju vsebine");
      } finally {
        f.setLoading(false);
      }
    });
  };

  // ... rest of your handlers and JSX remains unchanged ...

  return (
    <>
      {/* your existing JSX from above, now f.setLoading is available */}
    </>
  );
}
