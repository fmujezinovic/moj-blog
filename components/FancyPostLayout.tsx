'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ReactNode } from 'react';
import { Children, isValidElement, cloneElement } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShareButtons } from '@/components/posts/ShareButtons';
import NewsletterSignup from '@/components/posts/NewsletterSignup';

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
  heading: React.ReactElement;
  body: ReactNode[];
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

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
  let current: Omit<Section, 'heading'> & { heading: React.ReactElement | null } = {
    id: '',
    label: '',
    heading: null,
    body: [],
  };

  // Build sections array
  elements.forEach((el) => {
    if (isValidElement(el) && el.type === 'h2') {
      const headingEl = el as React.ReactElement<{ children?: ReactNode }>;
      if (current.heading) {
        sections.push({ ...current, heading: current.heading });
      }
      const text = headingEl.props.children?.toString() || '';
      current = {
        id: slugify(text),
        label: text,
        heading: headingEl,
        body: [],
      };
    } else if (current.heading) {
      current.body.push(el);
    }
  });
  if (current.heading) sections.push({ ...current, heading: current.heading });

  // Enhance <p> children: style <a> links
  function enhanceLinks(body: ReactNode[]) {
    return body.map((el, i) => {
      if (isValidElement(el) && el.type === 'p') {
        const paragraph = el as React.ReactElement<{ children?: ReactNode }>;
        const newChildren = Children.map(paragraph.props.children, (child) => {
          if (
            isValidElement(child) &&
            child.type === 'a'
          ) {
            // cast the <a> element so TS knows about className, target, rel
            const anchor = child as React.ReactElement<
              React.HTMLAttributes<HTMLAnchorElement>
            >;
            return cloneElement(anchor, {
              className:
                'text-primary underline decoration-1 underline-offset-2 hover:text-pink-700 transition-colors',
              target: '_blank',
              rel: 'noopener noreferrer',
            });
          }
          return child;
        });
        return cloneElement(paragraph, { key: i }, newChildren);
      }
      return el;
    });
  }

  return (
    <div className="flex flex-row-reverse bg-muted min-h-screen">
      {sections.length > 1 && (
        <aside className="hidden lg:block w-64 sticky top-24 self-start h-screen pt-12 pr-8">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-heading text-lg mb-4">Vsebina</h3>
            <ul className="space-y-2">
              {sections.map((sec, idx) => (
                <li key={`${sec.id}-${idx}`}>
                  <a
                    href={`#${sec.id}-${idx}`}
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
      <article className="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Cover */}
        {images[0] && (
          <motion.div /* ...your existing props... */>
            <Image
              src={images[0]!}
              alt="Naslovna slika"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
              priority
            />
          </motion.div>
        )}
        {/* Title, Intro, Sections, Conclusion, NewsletterSignup, ShareButtons, Nav */}
        {/* ...ostanka kode ne spreminjamo... */}
        {sections.map((section, idx) => (
          <motion.section key={idx} /* ... */>
            {cloneElement(
              section.heading,
              { className: 'font-heading text-3xl sm:text-4xl text-heading mb-6' }
            )}
            <div className="prose prose-lg prose-primary max-w-none font-subheading text-foreground">
              {enhanceLinks(section.body)}
            </div>
            {/* slike ... */}
          </motion.section>
        ))}
        {/* ... */}
      </article>
    </div>
  );
}
