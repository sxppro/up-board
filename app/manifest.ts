import { MetadataRoute } from 'next';
import { siteConfig } from './siteConfig';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    start_url: '/',
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
