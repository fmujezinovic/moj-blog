"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

import {
  parseMarkdownToSections,
  stringifySectionsToMarkdown,
  attachSectionImages,
  UiSection,
} from "@/utils/markdown";

import type { ImageRef } from "@/types/image";

export const usePostForm = () => {
  const supabase = createClient();
  const router   = useRouter();
  const { slug } = useParams<{ slug?: string }>();

  /* ------------------------------- STATE -------------------------------- */
  const [title, setTitle]         = useState("");
  const [published, setPublished] = useState(false);

  const [sections, setSections] = useState<UiSection[]>([
    { heading: "", content: "", imageUrl: "", uploadedImagePath: null },
  ]);
  const [selectedTab, setSelectedTab] = useState("0");

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId]  = useState("");

  const [images, setImages] = useState<ImageRef[]>([]);          // [cover, s1, s2…]
  const [coverUploadedPath, setCoverUploadedPath] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const isEdit                = Boolean(slug);

  /* ------------------------------ FETCHING ------------------------------ */
  useEffect(() => {
    (async () => {
      await fetchCategories();
      if (isEdit) await fetchPost();
      else        setImages([{ url: "", path: null }]); // placeholder za cover
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCategories = async () => {
    const { data, error } =
      await supabase.from("categories").select("id, name");
    if (error) toast.error("Greška pri dohvatu kategorija");
    else       setCategories(data ?? []);
  };

  const fetchPost = async () => {
    const { data, error } =
      await supabase.from("posts").select("*").eq("slug", slug!).single();
    if (error || !data) {
      toast.error("Greška pri dohvatu posta");
      router.push("/dashboard/posts");
      return;
    }

    setTitle(data.title);
    setPublished(!data.is_draft);
    setCategoryId(data.category_id);

    /* images mogu već biti [{url,path}] ili stari string[] */
    const imgArr: ImageRef[] = (Array.isArray(data.images) ? data.images : [])
      .map((img: any) =>
        typeof img === "string" ? { url: img, path: null } : img,
      );
    if (imgArr.length === 0) imgArr.push({ url: "", path: null });
    setImages(imgArr);
    setCoverUploadedPath(imgArr[0]?.path ?? null);

    /* sections + pripadajući path za svaku sliku */
    const baseSecs    = parseMarkdownToSections(data.content_md || "");
    const sectionsTmp = attachSectionImages(baseSecs, imgArr.map(i => i.url));
    sectionsTmp.forEach(
      (s, i) => (s.uploadedImagePath = imgArr[i + 1]?.path ?? null),
    );
    setSections(sectionsTmp.length ? sectionsTmp : sections);
    setSelectedTab("0");
  };

  /* ------------------------------ HANDLERS ------------------------------ */
  const addSection = () => {
    setSections(p => [
      ...p,
      { heading: "", content: "", imageUrl: "", uploadedImagePath: null },
    ]);
    setImages(p => [...p, { url: "", path: null }]);
    setSelectedTab(String(sections.length));
  };

  const updateSection = (
    idx: number,
    field: "heading" | "content",
    val: string,
  ) =>
    setSections(p => {
      const u = [...p];
      (u[idx] as any)[field] = val;
      return u;
    });

  const deleteSection = (idx: number) => {
    if (sections.length <= 1) {
      toast.error("Mora postojati barem jedna sekcija");
      return;
    }
    if (!confirm("Izbrisati sekciju?")) return;
    setSections(p => p.filter((_, i) => i !== idx));
    setImages  (p => p.filter((_, i) => i !== idx + 1)); // +1 jer je 0 cover
    setSelectedTab("0");
  };

  /* ------------------------------ IMAGES -------------------------------- */
  const setCoverImage = async (ref: ImageRef) => {
    if (coverUploadedPath) {
      await supabase.storage.from("images").remove([coverUploadedPath]);
    }
    setImages(p => {
      const u = [...p];
      u[0] = ref;
      return u;
    });
    setCoverUploadedPath(ref.path);
  };

  const setSectionImage = async (idx: number, ref: ImageRef) => {
    const old = sections[idx].uploadedImagePath;
    if (old) await supabase.storage.from("images").remove([old]);

    /* UI sekcija */
    setSections(p => {
      const u = [...p];
      u[idx].imageUrl          = ref.url;
      u[idx].uploadedImagePath = ref.path;
      return u;
    });

    /* images[] */
    setImages(p => {
      const u = [...p];
      while (u.length <= idx + 1) u.push({ url: "", path: null }); // osiguraj duljinu
      u[idx + 1] = ref;  // +1 jer 0 = cover
      return u;
    });
  };

  /* -------------------------------- SAVE -------------------------------- */
  const save = async () => {
    if (!title.trim() || !categoryId) {
      toast.error("Naslov i kategorija su obavezni");
      return;
    }
    if (!sections.some(s => s.heading.trim() && s.content.trim())) {
      toast.error("Bar jedna sekcija mora biti popunjena");
      return;
    }

    setLoading(true);
    const content_md   = stringifySectionsToMarkdown(sections);
    const imagesToSave = images; // šaljemo cijele objekte [{url,path}]

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("posts")
          .update({
            title,
            content_md,
            is_draft: !published,
            category_id: categoryId,
            images: imagesToSave,
          })
          .eq("slug", slug!);
        if (error) throw error;
        toast.success("Post ažuriran");
      } else {
        const newSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        const { error } = await supabase.from("posts").insert({
          title,
          slug: newSlug,
          content_md,
          is_draft: !published,
          category_id: categoryId,
          images: imagesToSave,
        });
        if (error) throw error;
        toast.success("Post kreiran");
      }
      router.push("/dashboard/posts");
    } catch (err) {
      console.error(err);
      toast.error("Greška pri spremanju");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------- PUBLIC API -------------------------- */
  return {
    /* state */
    title,
    setTitle,
    published,
    setPublished,
    sections,
    selectedTab,
    setSelectedTab,
    categories,
    categoryId,
    setCategoryId,
    images,
    coverUploadedPath,
    loading,
    isEdit,
    /* handlers */
    addSection,
    updateSection,
    deleteSection,
    setSectionImage,
    setCoverImage,
    save,
  };
};
