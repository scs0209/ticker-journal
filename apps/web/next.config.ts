import type { NextConfig } from 'next';
import Sonda from 'sonda/next';

const withSonda = Sonda({
  enabled: process.env.ANALYZE === 'true',
  open: false,
  gzip: true,
  format: 'html',
});

const nextConfig: NextConfig = {
  transpilePackages: ['@ticker-journal/shared'],
  allowedDevOrigins: ['127.0.0.1'],
  // Sonda는 source map 기반이라 production source maps 필요
  productionBrowserSourceMaps: process.env.ANALYZE === 'true',
};

export default withSonda(nextConfig);
