"use client";
import { useState, useTransition } from "react";
import { generateMetaDescription } from "@/lib/gemini";

interface Props {
  title: string;
  sections: { title: string; content: string }[];
  onChange: (desc: string) => void;
  initialDescription?: string;
}

export function MetaDescriptionGenerator({
  title,
  sections,
  onChange,
  initialDescription = "",
}: Props) {
  const [description, setDescription] = useState(initialDescription);
  const [isPending, startTransition] = useTransition();

  const allSectionsMarkdown = sections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");

  const handleClick = () => {
    startTransition(async () => {
      const desc = await generateMetaDescription(title, allSectionsMarkdown);
      setDescription(desc);
      onChange(desc);
    });
  };

  return (
    <div className="space-y-1">
      <label className="block font-medium">Opis (meta description)</label>
      <div className="flex gap-2">
        <textarea
          className="flex-1 border rounded p-2"
          value={description}
          maxLength={160}
          onChange={(e) => {
            setDescription(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Kratek opis za SEO (do 160 znakov)"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {isPending ? "Generiram…" : "AI napiši opis"}
        </button>
      </div>
      <p className="text-sm text-right">{description.length} / 160</p>
    </div>
  );
}
