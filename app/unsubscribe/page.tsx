import * as React from "react";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; resubscribe?: string }>;
}) {
  // 1. Await searchParams
  const { token, resubscribe } = await searchParams;
  const supabase = createClient();

  // 2. Opcijski prikaz ob ponovni prijavi
  if (resubscribe === "success") {
    return (
      <Message type="success" text="Ponovno si se uspešno prijavil ✅" />
    );
  }
  if (resubscribe === "error") {
    return (
      <Message type="error" text="Pri ponovni prijavi je prišlo do napake." />
    );
  }

  // 3. Manjkajoči token
  if (!token) {
    return <Message type="error" text="Manjka odjavni žeton." />;
  }

  // 4. Odjava v bazi
  const { data: emailRow, error } = await supabase
    .from("emails")
    .update({
      unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("confirmation_token", token)
    .select()
    .maybeSingle();

  if (error || !emailRow) {
    return (
      <Message
        type="error"
        text="Odjava ni uspela ali povezava ni veljavna."
      />
    );
  }

  // 5. Uspešno
  return (
    <Message type="success" text="Uspešno si se odjavil od prejemanja novic. 🙁">
      <form
        action="/api/newsletter/resubscribe"
        method="POST"
        className="mt-6"
      >
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
        >
          Želim se znova prijaviti
        </button>
      </form>
    </Message>
  );
}

function Message({
  type,
  text,
  children,
}: {
  type: "success" | "error";
  text: string;
  children?: React.ReactNode;
}) {
  const color = type === "success" ? "text-green-600" : "text-red-600";
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className={`text-xl font-medium ${color}`}>{text}</div>
      {children}
    </main>
  );
}
