const { execSync } = require('child_process');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GIT_HASH: execSync('git rev-parse --short HEAD').toString().trim(),
  },
  // ... rest of your next config
};

module.exports = nextConfig;
