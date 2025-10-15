import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

const withPWAConfig = withPWA({
  dest: 'public',
  disable: true, // Tắt hoàn toàn Next-PWA service worker để tránh conflict
});

export default withPWAConfig(nextConfig);
