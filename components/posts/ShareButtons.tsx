'use client'

import {
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react'

interface ShareButtonsProps {
  title: string
  url: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const buttons = [
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook size={18} />,
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <Twitter size={18} />,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin size={18} />,
    },
  ]

  return (
    <div className="mt-12 border-t pt-6">
      <h4 className="text-base font-semibold mb-4">Deli objavo:</h4>
      <div className="flex gap-3">
        {buttons.map((btn) => (
          <a
            key={btn.name}
            href={btn.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition hover:bg-primary hover:text-white hover:border-primary"
          >
            {btn.icon}
            {btn.name}
          </a>
        ))}
      </div>
    </div>
  )
}
