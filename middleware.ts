// middleware.ts
import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Matchuj sve route
export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
