import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col bg-background text-foreground">
      {/* Hero sekcija */}
      <section className="h-screen flex flex-col md:flex-row items-center">
        <div className="relative w-full md:w-1/2 h-80 md:h-full animate-fade-in md:animate-slide-in-left">
          <Image
            src="/hero.jpg"
            alt="Hero image"
            fill
            className="object-cover object-left"
            priority
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center px-6 md:px-12 py-12 animate-fade-in md:animate-slide-in-right">
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

      {/* Sekcije s kategorijami */}
      <section className="py-24 px-6 md:px-16 w-full flex flex-col gap-32">
        {/* Porodništvo (slika desno) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16 animate-fade-in md:animate-slide-in-right">
          <div className="relative w-full md:w-1/2 h-72 md:h-[480px]">
            <Image
              src="/images/porodnistvo.jpg"
              alt="Porodništvo"
              fill
              className="object-cover rounded-xl"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="font-heading text-4xl text-secondary mb-6">
              Porodništvo 👶
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Izkušnje, znanje in nasveti s področja ginekologije in porodništva.
            </p>
          </div>
        </div>

        {/* Umetna inteligenca (slika levo) */}
        <div className="flex flex-col md:flex-row items-center gap-16 animate-fade-in md:animate-slide-in-left">
          <div className="relative w-full md:w-1/2 h-72 md:h-[480px]">
            <Image
              src="/images/predavanja.jpg"
              alt="Umetna inteligenca"
              fill
              className="object-cover rounded-xl"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="font-heading text-4xl text-secondary mb-6">
              Umetna inteligenca 🤖
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Moji vpogledi v svet AI, raziskave in primeri uporabe v praksi.
            </p>
          </div>
        </div>

        {/* Programiranje (slika desno) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16 animate-fade-in md:animate-slide-in-right">
          <div className="relative w-full md:w-1/2 h-72 md:h-[480px]">
            <Image
              src="/images/ultrazvok.jpg"
              alt="Programiranje"
              fill
              className="object-cover rounded-xl"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="font-heading text-4xl text-secondary mb-6">
              Programiranje 💻
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Projekti, ideje in rešitve v svetu spletnega razvoja in programiranja.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
