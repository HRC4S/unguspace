import type { NextConfig } from "next";

const NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-mariadb'],
  experimental: {
    turbo: {
      resolveAlias: {
        '.prisma/client/default': './node_modules/.prisma/client/default.js',
      },
    },
  },
};

module.exports = NextConfig;