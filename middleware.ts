import { clerkMiddleware } from "@clerk/nextjs/server";

// All routes stay public — the preview never requires an account.
// Protected routes (/api/export, /api/checkout) enforce auth themselves
// via auth() so they can return proper 401 JSON instead of redirects.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
