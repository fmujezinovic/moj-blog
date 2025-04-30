export const metadata = {
  title: "404 – Stran ni najdena",
  description: "Stran, ki jo iščete, ne obstaja ali je bila premaknjena.",
};

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">404 – Stran ni najdena</h1>
      <p className="text-muted-foreground max-w-xl">
        Stran, ki jo iščete, ne obstaja, je bila odstranjena ali ni več dostopna.
      </p>
      <a
        href="/"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        ← Nazaj na domačo stran
      </a>
    </div>
  );
}
