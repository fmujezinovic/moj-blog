"use client";

import { ReactNode, Children, isValidElement, cloneElement } from "react";
import { motion } from "framer-motion";

interface FancyPostLayoutProps {
  title: string;
  content: ReactNode;
  images?: string[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function FancyPostLayout({ title, content, images = [] }: FancyPostLayoutProps) {
  const elements = Children.toArray(content);

  const sections: { heading: ReactNode; body: ReactNode[] }[] = [];
  let currentSection: { heading: ReactNode | null; body: ReactNode[] } = { heading: null, body: [] };

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
    <div className="flex flex-col gap-20 max-w-5xl mx-auto px-6 py-12">
      {/* Cover Image */}
      {images[0] && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full h-64 md:h-96 overflow-hidden rounded-xl shadow-md mb-8"
        >
          <img
            src={images[0]}
            alt="Naslovna slika"
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="font-heading text-4xl md:text-5xl text-center text-primary mb-12 leading-tight"
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
          className={`flex flex-col md:flex-row items-center gap-10 ${
            index % 2 === 0 ? "" : "md:flex-row-reverse"
          }`}
        >
          {/* Section Image */}
          {images[index + 1] && (
            <div className="relative w-full md:w-1/2 h-64 md:h-80 overflow-hidden rounded-xl shadow-md">
              <img
                src={images[index + 1]}
                alt={`Slika sekcije ${index + 1}`}
                className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}

          {/* Section Text */}
          <div className="w-full md:w-1/2">
            {cloneElement(section.heading as React.ReactElement, {
              className: "font-subheading text-2xl md:text-3xl text-secondary mb-4 leading-tight",
            })}
            <div className="space-y-4 text-base md:text-lg font-body text-foreground text-justify">
              {section.body}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
