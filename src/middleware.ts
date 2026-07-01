import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""
  
  // SEO Redirect: www to non-www
  if (hostname.startsWith("www.")) {
    const newHostname = hostname.replace("www.", "")
    return NextResponse.redirect(new URL(url.pathname + url.search, `https://${newHostname}`), 301)
  }
  
  // Check if we are on the admin subdomain
  const isAdminSubdomain = hostname.startsWith("admin.")
  
  // If we are on the admin subdomain
  if (isAdminSubdomain) {
    // Check authentication and role
    const isLoggedIn = !!req.auth
    const role = req.auth?.user?.role
    
    const isAdminOrEditor = role === "ADMIN" || role === "EDITOR"

    // If trying to access admin panel without correct permissions
    if (!isLoggedIn || !isAdminOrEditor) {
       // Allow access to login page on the admin subdomain
       if (url.pathname !== "/login") {
          return NextResponse.redirect(new URL("/login", req.url))
       }
    }

    // Rewrite to the (admin) route group
    if (!url.pathname.startsWith("/api")) {
      return NextResponse.rewrite(new URL(`/admin-panel${url.pathname === "/" ? "" : url.pathname}`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
