import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-panel/', '/api/', '/login', '/register'],
    },
    sitemap: 'https://uncultured.media/sitemap.xml',
  };
}
