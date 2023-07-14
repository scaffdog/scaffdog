// @ts-check

import { withContentlayer } from 'next-contentlayer';

/**
 * @type {import('next').NextConfig}
 */
export default withContentlayer({
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    scrollRestoration: true,
  },
});
