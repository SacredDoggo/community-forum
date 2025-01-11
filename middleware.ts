import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";


const isPrivatePageRoute = createRouteMatcher(["/new-post(.*)"]);
const isPrivateApiRoute = createRouteMatcher(["/api/new-post(.*)", "/api/update-post(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isPrivatePageRoute(request) || isPrivateApiRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};