import { MetadataRoute } from 'next';
import tradesData from '@/data/trades.json';
import citiesData from '@/data/cities.json';
import type { Trade, City } from '@/types';

const BASE_URL = 'https://www.ringbyring.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Trade landing pages (e.g., /plumber-answering-service)
  const tradePages: MetadataRoute.Sitemap = trades.map((trade) => ({
    url: `${BASE_URL}/${trade.slug}-answering-service`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Trade + City pages (e.g., /plumber-answering-service/hamilton)
  const tradeCityPages: MetadataRoute.Sitemap = [];
  for (const trade of trades) {
    for (const city of cities) {
      tradeCityPages.push({
        url: `${BASE_URL}/${trade.slug}-answering-service/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...tradePages, ...tradeCityPages];
}
