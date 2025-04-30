"use client";

import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface FancyPostLayoutProps {
  title: string;
  content: ReactNode;
  images?: string[];
  prev?: string | null;
  next?: string | null;
  category?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function FancyPostLayout({
  title,
  content,
  images = [],
  prev,
  next,
  category,
}: FancyPostLayoutProps) {
  const elements = Children.toArray(content);

  const sections: { heading: ReactNode; body: ReactNode[] }[] = [];
  let currentSection: { heading: ReactNode | null; body: ReactNode[] } = {
    heading: null,
    body: [],
  };

  elements.forEach((el) => {
    if (isValidElement(el) && el.type === "h2") {
      if (currentSection.heading) {
        sections.push(currentSection as { heading: ReactNode; body: ReactNode[] });
      }
      currentSection = { heading: el, body: [] };
    } else {
      currentSection.body.push(el);
    }
  });

  if (currentSection.heading) {
    sections.push(currentSection as { heading: ReactNode; body: ReactNode[] });
  }

  return (
    <div className="flex flex-col gap-20 max-w-5xl mx-auto px-6 py-12 bg-muted min-h-screen">
      {/* Cover Image */}
      {images[0] && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full h-64 md:h-96 overflow-hidden rounded-2xl shadow-md mb-12 relative"
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
        className="font-heading text-4xl md:text-5xl text-center text-heading mb-16 leading-tight"
      >
        {title}
      </motion.h1>

      {/* Sections */}
      {sections.map((section, index) => (
        <motion.div
          key={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, x: index % 2 === 0 ? 60 : -60 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.7,
                delay: index * 0.15,
                ease: "easeOut",
              },
            },
          }}
          className="bg-white rounded-2xl shadow-md p-8 grid md:grid-cols-2 gap-8 items-center"
        >
          {index % 2 === 0 ? (
            <>
              <div>
                {cloneElement(section.heading as React.ReactElement, {
                  className: "font-heading text-3xl sm:text-4xl text-heading mb-6",
                })}
                <div className="space-y-4 text-lg font-subheading text-foreground leading-relaxed text-justify">
                  {section.body}
                </div>
              </div>
              {images[index + 1] && (
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src={images[index + 1]}
                    alt={`Slika sekcije ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl shadow-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {images[index + 1] && (
                <div className="order-2 md:order-1 relative w-full h-64 md:h-80">
                  <Image
                    src={images[index + 1]}
                    alt={`Slika sekcije ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-xl shadow-md"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  />
                </div>
              )}
              <div className="order-1 md:order-2">
                {cloneElement(section.heading as React.ReactElement, {
                  className: "font-heading text-3xl sm:text-4xl text-heading mb-6",
                })}
                <div className="space-y-4 text-lg font-subheading text-foreground leading-relaxed text-justify">
                  {section.body}
                </div>
              </div>
            </>
          )}
        </motion.div>
      ))}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-12 border-t border-border">
        {prev ? (
          <Link
            href={`/blog/${category}/${prev}`}
            className="text-primary font-medium hover:underline"
          >
            ← Prejšnja objava
          </Link>
        ) : <div />}
        {next ? (
          <Link
            href={`/blog/${category}/${next}`}
            className="text-primary font-medium hover:underline"
          >
            Naslednja objava →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
