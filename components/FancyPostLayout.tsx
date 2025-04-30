// components/FancyPostLayout.tsx

"use client";

import { Fragment } from "react";
import type { ReactNode } from "react";
import { Children, isValidElement, cloneElement } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface FancyPostLayoutProps {
  title: string;
  intro?: string;
  content: ReactNode;
  conclusion?: string;
  images?: string[];
  prev?: string | null;
  next?: string | null;
  category?: string;
}

interface Section {
  id: string;
  label: string;
  heading: any; // Temporarily using any to fix type errors
  body: ReactNode[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

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
}: FancyPostLayoutProps) {
  const elements = Children.toArray(content);

  // Build sections and TOC
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

  return (
    <div className="flex flex-row-reverse bg-muted min-h-screen">
      {/* Sidebar TOC - sticky for md+ */}
      {sections.length > 1 && (
        <aside className="hidden lg:block w-64 sticky top-24 self-start h-screen pt-12 pr-8">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-heading text-lg mb-4">Vsebina</h3>
            <ul className="space-y-2">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
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
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="w-full h-64 md:h-[500px] overflow-hidden rounded-2xl shadow-md relative"
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="font-heading text-4xl md:text-5xl lg:text-6xl text-center text-heading mb-8 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Intro */}
        {intro && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <blockquote className="border-l-4 border-primary italic text-lg text-foreground mb-12 leading-loose first-line:font-bold first-letter:text-4xl bg-blue-50 p-6 rounded-lg shadow-sm">
              {intro}
            </blockquote>
          </motion.div>
        )}

        {/* Sections */}
        {sections.map((section, index) => (
          <motion.section
            key={section.id}
            id={section.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 60 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, delay: index * 0.15, ease: "easeOut" },
              },
            }}
            className="bg-white rounded-2xl shadow-md p-8 space-y-8"
          >
            {cloneElement(section.heading, {
              className: "font-heading text-3xl sm:text-4xl text-heading mb-6",
            })}
            <div className="space-y-4 text-lg font-subheading text-foreground leading-relaxed">
              {section.body}
            </div>
            {images[index + 1] && (
              <div className="relative w-full min-h-[400px] mt-8">
                <Image
                  src={images[index + 1]}
                  alt={`Slika sekcije ${index + 1}`}
                  fill
                  style={{ objectFit: "contain" }}
                  className="rounded-xl shadow-md bg-gray-50"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                />
              </div>
            )}
          </motion.section>
        ))}

        {/* Conclusion */}
        {conclusion && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <blockquote className="border-l-4 border-primary italic text-lg text-foreground mt-12 leading-loose first-line:font-bold first-letter:text-4xl bg-blue-50 p-6 rounded-lg shadow-sm">
              {conclusion}
            </blockquote>
          </motion.div>
        )}

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
