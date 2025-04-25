'use client';

import { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { motion } from 'framer-motion';

interface FancyPageLayoutProps {
  content: ReactNode;
  images: string[];
  heroImage?: string;
}

// Scroll reveal animacija
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function FancyPageLayout({ content, images, heroImage }: FancyPageLayoutProps) {
  const elements = Children.toArray(content);

  const mainHeading = elements.find(
    (el) => isValidElement(el) && el.type === 'h1'
  );

  const rest = elements.filter(
    (el) => !(isValidElement(el) && el.type === 'h1')
  );

  const sections: { heading: ReactNode; body: ReactNode[] }[] = [];
  let currentSection: { heading: ReactNode | null; body: ReactNode[] } = { heading: null, body: [] };

  rest.forEach((el) => {
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
    <div className="flex flex-col gap-20 max-w-5xl mx-auto px-6 py-12">
      {/* Glavni naslov */}
      {mainHeading && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-6"
        >
          {cloneElement(mainHeading as React.ReactElement, {
            className: 'font-heading text-h1 text-primary mb-4',
          })}
          {heroImage && (
            <img
              src={heroImage}
              alt="Glavna slika"
              className="w-40 h-40 rounded-full object-cover mx-auto shadow-md"
            />
          )}
        </motion.div>
      )}

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
          className={`grid md:grid-cols-2 gap-8 items-center py-12 px-4 rounded-xl ${
            index % 2 === 0 ? 'bg-card' : 'bg-muted'
          }`}
        >
          {index % 2 === 0 ? (
            <>
              <div>
                {cloneElement(section.heading as React.ReactElement, {
                  className: 'font-subheading text-h2 text-secondary mb-4',
                })}
                <div className="space-y-4 text-base font-body text-foreground text-justify">
                  {section.body}
                </div>
              </div>
              <div>
                <img
                  src={images[index % images.length]}
                  alt={`Slika sekcije ${index + 1}`}
                  className="rounded-lg shadow-md"
                />
              </div>
            </>
          ) : (
            <>
              <div className="order-2 md:order-1">
                <img
                  src={images[index % images.length]}
                  alt={`Slika sekcije ${index + 1}`}
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="order-1 md:order-2">
                {cloneElement(section.heading as React.ReactElement, {
                  className: 'font-subheading text-h2 text-secondary mb-4',
                })}
                <div className="space-y-4 text-base font-body text-foreground text-justify">
                  {section.body}
                </div>
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
