"use client";

import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ImageRef } from "@/types/image";

interface FancyPageLayoutProps {
  content: ReactNode;
  images: (ImageRef | string)[];
  heroImage?: ImageRef | string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function FancyPageLayout({ content, images, heroImage }: FancyPageLayoutProps) {
  const elements = Children.toArray(content);

  const mainHeading = elements.find((el) => isValidElement(el) && el.type === "h1");

  const rest = elements.filter((el) => !(isValidElement(el) && el.type === "h1"));

  const sections: { heading: ReactNode; body: ReactNode[] }[] = [];
  let currentSection: { heading: ReactNode | null; body: ReactNode[] } = {
    heading: null,
    body: [],
  };

  rest.forEach((el) => {
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

  const resolveUrl = (img: ImageRef | string | undefined): string | null => {
    if (!img) return null;
    return typeof img === "string" ? img : img.url;
  };

  return (
    <div className="flex flex-col gap-20 max-w-5xl mx-auto px-6 py-12">
      {/* Glavni naslov + hero slika */}
      {mainHeading && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          {cloneElement(mainHeading as React.ReactElement, {
            className: "font-heading text-5xl sm:text-6xl text-primary mb-6",
          })}
          {resolveUrl(heroImage) && (
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-lg relative">
              <Image
                src={resolveUrl(heroImage)!}
                alt="Glavna slika"
                fill
                className="object-cover"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Sekcije */}
      {sections.map((section, index) => {
        const imageUrl = resolveUrl(images[index]);

        return (
          <motion.div
            key={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, x: index % 2 === 0 ? 80 : -80 },
              visible: {
                opacity: 1,
                x: 0,
                transition: { duration: 0.8, delay: index * 0.2, ease: "easeOut" },
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
                {imageUrl && (
                  <div className="relative w-full h-64">
                    <Image
                      src={imageUrl}
                      alt={`Slika sekcije ${index + 1}`}
                      fill
                      className="object-contain rounded-xl shadow-md"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                {imageUrl && (
                  <div className="relative w-full h-64 order-2 md:order-1">
                    <Image
                      src={imageUrl}
                      alt={`Slika sekcije ${index + 1}`}
                      fill
                      className="object-contain rounded-xl shadow-md"
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
        );
      })}
    </div>
  );
}
