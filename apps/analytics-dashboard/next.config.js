/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  transpilePackages: ['@repo/ui'],
  webpack: (config) => {
    // Work around next-auth's legacy CSS helper in RSC/App Router by aliasing it to a no-op shim.
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    const shimPath = path.resolve(__dirname, 'src/lib/next-auth-css-shim.js');
    config.resolve.alias['next-auth/css'] = shimPath;
    config.resolve.alias['next-auth/css/index.js'] = shimPath;
    return config;
  },
};

module.exports = nextConfig;
