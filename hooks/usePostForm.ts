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
import { extractPathFromPublicUrl } from "@/utils/storage";

// Local definition of ImageRef (no longer imported)
interface ImageRef {
  url: string;
  path: string | null;
}

export const usePostForm = () => {
  const supabase = createClient();
  const router = useRouter();
  const { slug } = useParams<{ slug?: string }>();

  /* ---------------- STATE ---------------- */
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [sections, setSections] = useState<UiSection[]>([
    { heading: "", content: "", imageUrl: "", uploadedImagePath: null },
  ]);
  const [selectedTab, setSelectedTab] = useState("0");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<ImageRef[]>([]);
  const [coverUploadedPath, setCoverUploadedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(slug);
  const [publishDate, setPublishDate] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [intro, setIntro] = useState("");           // ← for intro
  const [conclusion, setConclusion] = useState(""); // ← for conclusion

  /* ------------- FETCHING -------------- */
  useEffect(() => {
    (async () => {
      await fetchCategories();
      if (isEdit) await fetchPost();
      else setImages([{ url: "", path: null }]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("id, name");
    if (error) toast.error("Napaka pri nalaganju kategorij");
    else setCategories(data ?? []);
  };

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug!)
      .single();

    if (error) {
      toast.error("Napaka pri nalaganju posta");
      return;
    }
    if (!data) return;

    setTitle(data.title);
    setPublished(!data.is_draft);
    setCategoryId(data.category_id);
    setDescription(data.description || "");
    setIntro(data.intro || "");
    setConclusion(data.conclusion || "");
    setPublishDate(data.published_at ? new Date(data.published_at).toISOString() : null);

    // reconstruct ImageRef[] from stored array or single URL
    const imgArr: ImageRef[] = (Array.isArray(data.images) ? data.images : []).map((img: any) =>
      typeof img === "string"
        ? { url: img, path: extractPathFromPublicUrl(img) }
        : img
    );
    if (imgArr.length === 0) imgArr.push({ url: "", path: null });
    setImages(imgArr);
    setCoverUploadedPath(imgArr[0]?.path ?? null);

    const baseSecs = parseMarkdownToSections(data.content_md || "");
    const sectionsTmp = attachSectionImages(baseSecs, imgArr.map(i => i.url));
    sectionsTmp.forEach((s, i) => (s.uploadedImagePath = imgArr[i + 1]?.path ?? null));
    setSections(sectionsTmp.length ? sectionsTmp : sections);
    setSelectedTab("0");
  };

  /* ------------- HANDLERS -------------- */
  const addSection = () => {
    const newIdx = sections.length;
    setSections(p => [...p, { heading: "", content: "", imageUrl: "", uploadedImagePath: null }]);
    setImages(p => [...p, { url: "", path: null }]);
    setSelectedTab(String(newIdx));
    return newIdx;
  };

  const updateSection = (idx: number, field: "heading" | "content", val: string) => {
    setSections(p => {
      const u = [...p];
      (u[idx] as any)[field] = val;
      return u;
    });
  };

  const deleteSection = (idx: number) => {
    if (sections.length <= 1) {
      toast.error("Mora obstajati vsaj ena sekcija");
      return;
    }
    if (!confirm("Želite izbrisati sekcijo?")) return;
    setSections(p => p.filter((_, i) => i !== idx));
    setImages(p => p.filter((_, i) => i !== idx + 1));
    setSelectedTab("0");
  };

  /* ------------- IMAGES -------------- */
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
    const oldPath = sections[idx].uploadedImagePath;
    if (oldPath) {
      await supabase.storage.from("images").remove([oldPath]);
    }
    setSections(p => {
      const u = [...p];
      u[idx].imageUrl = ref.url;
      u[idx].uploadedImagePath = ref.path;
      return u;
    });
    setImages(p => {
      const u = [...p];
      while (u.length <= idx + 1) u.push({ url: "", path: null });
      u[idx + 1] = ref;
      return u;
    });
  };

  /* ------------- SAVE -------------- */
  const save = async () => {
    if (!title.trim() || !categoryId) {
      toast.error("Naslov in kategorija sta obvezna");
      return;
    }
    if (!description.trim() || description.length > 160) {
      toast.error("Opis (description) je obvezen in naj bo ≤160 znakov");
      return;
    }
    if (!sections.some(s => s.heading.trim() && s.content.trim())) {
      toast.error("Vsaj ena sekcija mora biti izpolnjena");
      return;
    }

    setLoading(true);
    const content_md = stringifySectionsToMarkdown(sections);

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("posts")
          .update({
            title,
            description,
            intro,
            content_md,
            conclusion,
            is_draft: !published,
            category_id: categoryId,
            images,
            published_at: publishDate,
          })
          .eq("slug", slug!);
        if (error) throw error;
        toast.success("Post posodobljen");
      } else {
        const newSlug = title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        const { error } = await supabase.from("posts").insert({
          title,
          description,
          intro,
          content_md,
          conclusion,
          slug: newSlug,
          is_draft: !published,
          category_id: categoryId,
          images,
          published_at: publishDate,
        });
        if (error) throw error;
        toast.success("Post ustvarjen");
      }
      router.push("/dashboard/posts");
    } catch (e) {
      console.error(e);
      toast.error("Napaka pri shranjevanju");
    } finally {
      setLoading(false);
    }
  };

  /* -------- PUBLIC API -------- */
  return {
    // basic fields
    title, setTitle,
    published, setPublished,
    description, setDescription,
    intro, setIntro,
    conclusion, setConclusion,
    publishDate, setPublishDate,
    // categories
    categories,
    categoryId, setCategoryId,
    // sections & images
    sections, setSections,
    selectedTab, setSelectedTab,
    addSection, updateSection, deleteSection,
    images,
    setCoverImage, setSectionImage,
    coverUploadedPath,
    // fetch/save
    loading,
    save,
    isEdit,
  };
};
