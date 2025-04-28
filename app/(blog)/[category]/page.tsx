"use client";

import { useState, useEffect, use } from "react";
import { loadContentList } from "@/lib/loadContent";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await loadContentList({
        table: "posts",
        categorySlug: category,
      });

      if (data) {
        setPosts(data);
        setFilteredPosts(data);
      }
    }
    fetchPosts();
  }, [category]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPosts(
        posts.filter((post) =>
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, posts]);

  if (!posts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="font-heading text-4xl text-primary mb-4">Kategorija ni najdena</h1>
        <p className="font-body text-muted-foreground">Poskusite kasneje.</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12 bg-background text-foreground">
      {/* Title */}
      <h1 className="font-heading text-4xl md:text-5xl text-primary text-center capitalize">
        {category.replace(/-/g, " ")}
      </h1>

      {/* Search Input */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Pretraži naslove..."
          className="w-full max-w-md p-3 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <p className="font-body text-base text-muted-foreground text-center">
          Ni rezultatov za "{searchQuery}".
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => {
            console.log("POST IMAGES", post.images); // DODAJ OVO
            let coverImage = "/images/placeholder.jpg";

            try {
              const imagesArray = Array.isArray(post.images)
                ? post.images
                : JSON.parse(post.images || "[]");

              if (Array.isArray(imagesArray) && imagesArray.length > 0 && imagesArray[0]?.url) {
                coverImage = imagesArray[0].url;
              }
            } catch (error) {
              console.error("Greška pri parsiranju images za post:", post.slug);
            }

            return (
              <Link
                key={post.id}
                href={`/${category}/${post.slug}`}
                className="group"
              >
                <article className="flex flex-col md:flex-row bg-muted rounded-xl overflow-hidden hover:shadow-lg transition-all h-full">
                  {/* Cover Image */}
                  <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
                    <Image
                      src={coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <h2 className="font-subheading text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="font-body text-sm text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("sl-SI")
                        : "Datum neznan"}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
