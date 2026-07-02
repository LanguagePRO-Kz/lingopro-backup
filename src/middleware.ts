import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // not signed in → send to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // signed in → funnel based on the user's profile state
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("quiz_result, plan")
    .eq("id", user.id)
    .maybeSingle();

  // if the profiles table is unavailable, don't lock the user out
  if (!error) {
    if (!profile?.quiz_result && path !== "/quiz" && !path.startsWith("/quiz/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/quiz";
      return NextResponse.redirect(url);
    }
    if (profile?.quiz_result && !profile?.plan && path !== "/pricing") {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
