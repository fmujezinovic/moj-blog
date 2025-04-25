'use client';

export default function RenderedMDX({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose dark:prose-invert max-w-3xl mx-auto px-6 py-8">
      {children}
    </div>
  );
}
