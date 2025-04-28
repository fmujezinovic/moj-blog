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
 <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 py-16" style={{ backgroundColor: "#ACB0D4" }}>
      <div className="flex flex-col items-center gap-8">
        
        {/* Card s sliko */}
        <div className="bg-white rounded-xl shadow-2xl p-4 w-64 h-64 flex items-center justify-center">
          <div className="relative w-56 h-56 overflow-hidden rounded-lg group">
            <Image
              src="/hero.jpg"
              alt="Hero avatar"
              fill
              className="object-cover object-[0.5%_center] transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </div>
        </div>

        {/* Naslov */}
        <h1 className="font-heading text-5xl md:text-6xl text-heading mb-4 leading-tight text-fuchsia-950">
          Dobrodošli na moj blog
        </h1>

        {/* Opis */}
        <p className="bg-slate-100  font-subheading text-lg md:text-xl text-muted-foreground mb-8 max-w-xl shadow-2xl rounded text-fuchsia-950">
          Od medicine do programiranja — in vsega vmes, kar pritegne mojo radovednost.
        </p>

        {/* Gumb */}
        <Link
          href="/o-meni"
          className="inline-block font-subheading text-lg px-6 py-3 rounded-md bg-[#7B4C9A] text-white hover:bg-[#693f81] transition"
        >
          Več o meni
        </Link>
      </div>
    </section>


      {/* Dinamične kategorije */}
<section id="kategorije" className="py-24 px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
