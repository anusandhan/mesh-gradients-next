// PostHog is reverse-proxied through /ingest so ad blockers can't drop
// analytics requests. Region comes from NEXT_PUBLIC_POSTHOG_HOST
// (https://us.i.posthog.com or https://eu.i.posthog.com); the static
// assets live on the matching *-assets host.
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const posthogAssetsHost = posthogHost.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native addon: must be required at runtime, not bundled
  serverExternalPackages: ["@napi-rs/canvas"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  // PostHog's API paths end in a trailing slash
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig
