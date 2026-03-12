/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  transpilePackages: ['@repo/ui'],
  webpack: (config) => {
    // Work around next-auth's legacy CSS helper (large inline string breaks webpack) by replacing with no-op shim.
    const shimPath = path.resolve(__dirname, 'src/lib/next-auth-css-shim.js');
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/[\\/]next-auth[\\/]css[\\/]index\.js$/, shimPath)
    );
    return config;
  },
};

module.exports = nextConfig;
