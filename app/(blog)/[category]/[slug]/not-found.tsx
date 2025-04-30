export const metadata = {
  title: "404 – Objave ni bilo mogoče najti",
  description: "Žal, iskana objava ne obstaja ali je bila odstranjena.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-red-600">Objava ni najdena</h1>
      <p className="text-muted-foreground max-w-xl">
        Članek, ki ga iščete, ne obstaja, je bil izbrisan ali še ni bil objavljen.
      </p>
      <a
        href="/blog"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        ← Nazaj na blog
      </a>
    </div>
  );
}
