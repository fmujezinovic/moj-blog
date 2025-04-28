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
<section className="w-full">
  {categories?.map((cat) => (
    <div key={cat.id} className="relative h-[80vh] flex items-center justify-center text-center">
      <Image
        src={`/images/${cat.slug}.jpg`}
        alt={cat.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div className="relative z-10 text-white px-6">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">{cat.name}</h2>
        <Link
          href={`/${cat.slug}`}
          className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
