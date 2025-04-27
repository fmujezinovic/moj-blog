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
      <section className="py-24 px-6 md:px-16 w-full flex flex-col gap-32">
        {categories?.map((cat, index) => (
          <div
            key={cat.id}
            className={`flex flex-col md:flex-row ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            } items-center gap-16`}
          >
            <div className="relative w-full md:w-1/2 h-72 md:h-[480px]">
              <Image
                src={`/images/${cat.slug}.jpg`} // npr: umetna-inteligenca.jpg
                alt={cat.name}
                fill
                className="object-cover rounded-xl"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="font-heading text-4xl text-secondary mb-6">
                {cat.name}
              </h2>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                {/* Lahko dodaš opis kategorije če imaš `cat.description` */}
              </p>
              <Link
                href={`/${cat.slug}`}
                className="inline-block font-subheading text-base px-6 py-2 rounded-md bg-muted text-foreground hover:bg-muted/60 transition"
              >
                Poglej objave →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
