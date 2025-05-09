'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Category = {
  id: string
  name: string
  slug: string
  image_url: string | null
}

type Post = {
  slug: string
  categories: { slug: string }
}

export default function HomeClient({
  categories,
  latestPost,
}: {
  categories: Category[]
  latestPost: Post
}) {
  useEffect(() => {
    if (window.location.hash === '#kategorije') {
      const el = document.getElementById('kategorije')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const postSlug = latestPost?.slug ?? 'no-post'
  const categorySlug = latestPost?.categories?.slug ?? 'no-category'

  return (
    <main className="flex flex-col bg-pink-100 text-pink-900">
      {/* Hero sekcija */}
      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 py-16 bg-gradient-to-br from-purple-700 via-purple-500 to-purple-300 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-500 to-purple-300 animate-gradient-move opacity-50 pointer-events-none -z-10" />

        <style jsx>{`
          @keyframes gradient-move {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient-move {
            background-size: 200% 200%;
            animation: gradient-move 10s ease infinite;
          }
        `}</style>

        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-64 h-64 md:w-96 md:h-96 overflow-hidden rounded-full shadow-lg border-4 border-white">
            <Image
              src="/hero2.jpg"
              alt="Hero avatar"
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
              priority
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center md:items-start gap-6 text-center md:text-left">
          <div className="flex justify-center">
            <img
              src="/ginAIblog-transparent-white-cut.png"
              className="max-w-full h-auto w-[300px] md:w-[500px] drop-shadow-lg"
              alt="ginAI-blog logo"
            />
          </div>

          <p className="font-subheading text-lg md:text-2xl max-w-lg">
            Od medicine do umetne inteligence — in vsega vmes, kar pritegne mojo radovednost.
          </p>
          <Link
            href={`/${categorySlug}/${postSlug}`}
            className="inline-block font-subheading text-lg px-8 py-4 rounded-md bg-white text-purple-700 shadow-lg hover:shadow-xl active:shadow-md transition-shadow duration-200"
          >
            Ne zamudi zadnje objave
          </Link>
        </div>
      </section>

      {/* Kategorije */}
      <section
        id="kategorije"
        className="py-24 px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 bg-purple-50"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${cat.slug}`}
            className="group rounded-xl overflow-hidden bg-white hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="relative h-64">
              <Image
                src={cat.image_url ?? `/images/${cat.slug}.jpg`}
                alt={cat.name}
                fill
                className="object-cover group-hover:opacity-80 transition"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-purple-900">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
