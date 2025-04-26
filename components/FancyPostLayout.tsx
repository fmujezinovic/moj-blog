'use client';

import { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { motion } from 'framer-motion';

interface FancyPostLayoutProps {
  title: string;
  content: ReactNode;
  images?: string[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function FancyPostLayout({ title, content, images = [] }: FancyPostLayoutProps) {
  const elements = Children.toArray(content);

  const sections: { heading: ReactNode; body: ReactNode[] }[] = [];
  let currentSection: { heading: ReactNode | null; body: ReactNode[] } = { heading: null, body: [] };

  elements.forEach((el) => {
    if (isValidElement(el) && el.type === 'h2') {
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
    <div className="flex flex-col gap-20 max-w-4xl mx-auto px-6 py-12">
      {/* Glavni naslov iz props */}
      <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="font-heading text-h1 text-primary text-center mb-8"
      >
        {title}
      </motion.h1>

      {/* Sekcije */}
      {sections.map((section, index) => (
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
              transition: {
                duration: 0.8,
                delay: index * 0.2,
                ease: 'easeOut',
              },
            },
          }}
          className={`flex flex-col md:flex-row items-center gap-12 ${
            index % 2 === 0 ? '' : 'md:flex-row-reverse'
          }`}
        >
          {images.length > 0 && (
            <div className="relative w-full md:w-1/2 h-64 md:h-96">
              <img
                src={images[index % images.length]}
                alt={`Slika sekcije ${index + 1}`}
                className="object-cover rounded-lg shadow-md w-full h-full"
              />
            </div>
          )}
          <div className="w-full md:w-1/2">
            {cloneElement(section.heading as React.ReactElement, {
              className: 'font-subheading text-h2 text-secondary mb-4',
            })}
            <div className="space-y-4 text-base font-body text-foreground text-justify">
              {section.body}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
