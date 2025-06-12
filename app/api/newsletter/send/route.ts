import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST() {
  const supabase = createClient();

  // 1. Pridobi najnovejši objavljen post
  const { data: latestPost, error: postError } = await supabase
    .from('posts')
    .select('title, slug, categories ( slug )')
    .eq('is_draft', false)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (postError || !latestPost) {
    return NextResponse.json(
      { error: 'Ni objavljenih vsebin' },
      { status: 404 }
    );
  }

  const categorySlug =
    Array.isArray(latestPost.categories) && latestPost.categories.length > 0
      ? latestPost.categories[0].slug
      : '';

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${categorySlug}/${latestPost.slug}`;

  // 2. Pridobi vse naročnike
  const { data: subscribers, error: subError } = await supabase
    .from('emails')
    .select('email, confirmation_token')
    .eq('confirmed', true)
    .eq('unsubscribed', false);

  if (subError || !subscribers) {
    return NextResponse.json(
      { error: 'Napaka pri branju naročnikov' },
      { status: 500 }
    );
  }

  // 3. Pripravi sporočila
  const emails = subscribers.map(({ email, confirmation_token }) => ({
    from: 'newsletter@farismujezinovic.com',
    to: email,
    subject: `🆕 Nova objava: ${latestPost.title}`,
    html: `
      <h2>${latestPost.title}</h2>
      <p>Preberi novo objavo na našem blogu:</p>
      <p><a href="${postUrl}">Klikni tukaj za ogled</a></p>
      <p style="font-size:12px; color:gray;">
        Ne želiš več prejemati sporočil?
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?token=${confirmation_token}">Odjava</a>
      </p>
    `,
  }));

  // 4. Pošlji vse
  await Promise.all(
    emails.map((message) => resend.emails.send(message))
  );

  return NextResponse.json({ success: true, sent: emails.length }, { status: 200 });
}
