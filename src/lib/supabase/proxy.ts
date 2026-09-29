import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  // Refreshes the session if needed. Keep this right after createServerClient.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = !!data?.claims;

  const path = request.nextUrl.pathname;
  const isStaffArea = ["/dashboard", "/queue", "/admin"].some((p) =>
    path.startsWith(p),
  );
  const isKioskArea = path.startsWith("/kiosk") && path !== "/kiosk/login";

  if (!isLoggedIn && (isStaffArea || isKioskArea)) {
    const url = request.nextUrl.clone();
    url.pathname = isKioskArea ? "/kiosk/login" : "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
