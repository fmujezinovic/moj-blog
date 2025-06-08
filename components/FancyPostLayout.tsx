"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


import { Fragment } from "react";
import type { ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShareButtons } from "@/components/posts/ShareButtons";
import NewsletterSignup from "@/components/posts/NewsletterSignup";

interface FancyPostLayoutProps {
  title: string;
  intro?: string;
  content: ReactNode;
  conclusion?: string;
  images?: string[];
  prev?: string | null;
  next?: string | null;
  category?: string;
  slug: string;
}

interface Section {
  id: string;
  label: string;
  heading: any;
  body: ReactNode[];
}



const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function FancyPostLayout({
  title,
  intro,
  content,
  conclusion,
  images = [],
  prev,
  next,
  category,
  slug,
}: FancyPostLayoutProps) {
  const elements = Children.toArray(content);

  const sections: Section[] = [];
  let current: Omit<Section, "heading"> & { heading: JSX.Element | null } = {
    id: "",
    label: "",
    heading: null,
    body: [],
  };

  elements.forEach((el) => {
    if (isValidElement(el) && el.type === "h2") {
      if (current.heading) {
        sections.push({ ...current, heading: current.heading });
      }
      const text = el.props.children?.toString() || "";
      current = { id: slugify(text), label: text, heading: el, body: [] };
    } else if (current.heading) {
      current.body.push(el);
    }
  });

  if (current.heading) {
    sections.push({ ...current, heading: current.heading });
  }

  function enhanceLinks(body: ReactNode[]) {
    return body.map((el, i) => {
      if (isValidElement(el) && el.type === "p") {
        return cloneElement(el, {
          key: i,
          children: Children.map(el.props.children, (child) => {
            if (isValidElement(child) && child.type === "a") {
              return cloneElement(child, {
                className:
                  "text-primary underline decoration-1 underline-offset-2 hover:text-pink-700 transition-colors",
                target: "_blank",
                rel: "noopener noreferrer",
              });
            }
            return child;
          }),
        });
      }
      return el;
    });
  }
  

  return (
    <div className="flex flex-row-reverse bg-muted min-h-screen">
      {/* Sidebar TOC */}
      {sections.length > 1 && (
        <aside className="hidden lg:block w-64 sticky top-24 self-start h-screen pt-12 pr-8">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-heading text-lg mb-4">Vsebina</h3>
            <ul className="space-y-2">
              {sections.map((sec, index) => (
                <li key={`${sec.id}-${index}`}>
                  <a
                    href={`#${sec.id}-${index}`}
                    className="text-primary hover:underline block py-1 px-2 rounded transition-colors hover:bg-primary/5"
                  >
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      {/* Main content */}
      <article className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Cover */}
        {images[0] && (
          <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="w-full h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden rounded-xl shadow-md relative"
        >
            <Image
              src={images[0]}
              alt="Naslovna slika"
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
              priority
            />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          
          className="
          font-heading
          text-2xl           // base (mobile)
          sm:text-3xl        // ≥640px
          md:text-4xl        // ≥768px
          lg:text-5xl        // ≥1024px
          leading-tight
          text-center
          text-heading
          tracking-tight
          max-w-3xl
          mx-auto
          mb-10
        "
        >
          {title}
        </motion.h1>

        {/* Intro */}
        {intro && (
  <motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  viewport={{ once: true }}
>

   <div className="prose prose-lg prose-primary max-w-none font-sans not-italic text-foreground border-l-4 border-primary mb-12 bg-blue-50 p-6 rounded-lg shadow-sm">


              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
        rel="noopener noreferrer"
              className="text-primary underline decoration-1 underline-offset-2 hover:text-pink-700 transition-colors"
            />
          ),
        }}
      >
        {intro}
      </ReactMarkdown>
    </div>
  </motion.div>
)}

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.section
          key={`${section.id}-${index}`}
          id={`${section.id}-${index}`}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-md p-8 space-y-8"
          >
            {cloneElement(section.heading, {
              className: "font-heading text-3xl sm:text-4xl text-heading mb-6",
            })}
            <div className="prose prose-lg prose-primary max-w-none font-subheading text-foreground">
            {enhanceLinks(section.body)}
            </div>
            {images[index + 1] && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.3 }}
    className="w-full h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden rounded-xl shadow-md relative mt-8"
  >
    <Image
      src={images[index + 1]}
      alt={`Slika sekcije ${index + 1}`}
      fill
      style={{ objectFit: "cover" }}
      className="transition-transform duration-500 hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
    />
  </motion.div>
)}

          </motion.section>
        ))}

        {/* Conclusion */}
        {conclusion && (
  <motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  viewport={{ once: true }}
>
    <div className="prose prose-lg prose-primary max-w-none font-sans not-italic text-foreground border-l-4 border-primary mb-12 bg-blue-50 p-6 rounded-lg shadow-sm">

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-1 underline-offset-2 hover:text-pink-700 transition-colors"
            />
          ),
        }}
      >
        {conclusion}
      </ReactMarkdown>
    </div>
  </motion.div>
)}


        <NewsletterSignup />

        <ShareButtons
          title={title}
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/${category}/${slug}`}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-12 border-t border-border">
          {prev ? (
            <Link
              href={`/blog/${category}/${prev}`}
              className="text-primary font-medium hover:underline flex items-center gap-2"
            >
              <span>←</span> Prejšnja objava
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${category}/${next}`}
              className="text-primary font-medium hover:underline flex items-center gap-2"
            >
              Naslednja objava <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>
    </div>
  );
}
