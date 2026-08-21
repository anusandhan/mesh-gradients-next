/** @type {import('next').NextConfig} */
const nextConfig = {
  // Native addon: must be required at runtime, not bundled
  serverExternalPackages: ["@napi-rs/canvas"],
}

module.exports = nextConfig
