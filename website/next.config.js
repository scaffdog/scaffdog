const { withContentlayer } = require('next-contentlayer');

module.exports = withContentlayer({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
});
