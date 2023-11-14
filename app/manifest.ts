import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Soppro Dashboard',
    short_name: 'Soppro Dashboard',
    description: 'Smart financial analysis by Soppro',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    start_url: '/',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
