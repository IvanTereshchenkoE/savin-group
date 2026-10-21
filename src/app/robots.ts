import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://example.ru';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_console/', '/api/admin/', '/api/internal/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
