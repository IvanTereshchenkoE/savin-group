import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://example.ru';

  const staticRoutes = [
    '',
    '/spb',
    '/nn',
    '/calculator',
    '/normy',
    '/contacts',
    '/privacy',
    '/personal-data-consent',
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' || route === '/spb' || route === '/nn' ? 1.0 : 0.8,
  }));
}
