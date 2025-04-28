// app/page.tsx
import { createClient } from "@/utils/supabase/client"
import Link from "next/link";
import Image from "next/image";



export default async function HomePage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <main className="flex flex-col bg-background text-foreground">
      {/* Hero sekcija */}
      <section className="h-screen flex flex-col md:flex-row items-center">
        <div className="relative w-full md:w-1/2 h-80 md:h-full">
          <Image
            src="/hero.jpg"
            alt="Hero image"
            fill
            className="object-cover object-left"
            priority
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center px-6 md:px-12 py-12">
          <h1 className="font-heading text-5xl md:text-6xl text-primary mb-6">
            Dobrodošli na moj blog
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground mb-8 max-w-md">
            Od medicine do programiranja — in vsega vmes, kar pritegne mojo radovednost.
          </p>
          <Link
            href="/o-meni"
            className="inline-block font-subheading text-lg px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            Več o meni
          </Link>
        </div>
      </section>

      {/* Dinamične kategorije */}
     <section className="py-24 px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
  {categories?.map((cat) => (
    <Link
      key={cat.id}
      href={`/${cat.slug}`}
      className="group rounded-xl overflow-hidden bg-muted hover:shadow-lg transition transform hover:scale-105"
    >
      <div className="relative h-64">
        <Image
          src={`/images/${cat.slug}.jpg`}
          alt={cat.name}
          fill
          className="object-cover group-hover:opacity-80 transition"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
        <p className="text-muted-foreground text-sm">
          {/* cat.description ? cat.description : "Preberi več" */}
        </p>
      </div>
    </Link>
  ))}
</section>

    </main>
  );
}
