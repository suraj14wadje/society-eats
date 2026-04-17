import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

// Anyone (authed or not) can hit these paths. Everything outside this set that
// isn't /admin/* still requires a session, but doesn't require a profile.
const PUBLIC_PATHS = new Set(["/", "/cart", "/checkout", "/checkout/verify"]);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Admin paths require a signed-in admin. Non-admins get bounced to the menu.
  if (isAdminPath(pathname)) {
    if (!user) return redirectTo(request, "/");
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.is_admin) return redirectTo(request, "/");
    return response;
  }

  // Public paths: menu, cart, checkout, OTP. Anyone can see them.
  if (isPublicPath(pathname)) return response;

  // Everything else (history, orders) requires a session. RLS enforces per-row
  // visibility so no need to also re-check profile here.
  if (!user) return redirectTo(request, "/");

  return response;
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}
