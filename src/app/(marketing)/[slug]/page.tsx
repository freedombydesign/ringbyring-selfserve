import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import tradesData from '@/data/trades.json';
import citiesData from '@/data/cities.json';
import { TradeCityPage } from '@/components/seo/TradeCityPage';
import type { Trade, City } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Parse slug like "plumber-hamilton" into trade and city
function parseSlug(slug: string): { trade: Trade; city: City } | null {
  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];

  // Try each trade to find a match
  for (const trade of trades) {
    if (slug.startsWith(`${trade.slug}-`)) {
      const citySlug = slug.slice(trade.slug.length + 1);
      const city = cities.find((c) => c.slug === citySlug);
      if (city) {
        return { trade, city };
      }
    }
  }

  return null;
}

// Generate all trade x city combinations at build time
export async function generateStaticParams() {
  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];

  const params: { slug: string }[] = [];

  for (const trade of trades) {
    for (const city of cities) {
      params.push({ slug: `${trade.slug}-${city.slug}` });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    return {
      title: 'Page Not Found | RingByRing',
    };
  }

  const { trade, city } = parsed;

  const title = `AI Receptionist for ${trade.display_plural} in ${city.display_name} | RingByRing`;
  const description = `${trade.pain_headline} RingByRing answers calls 24/7 for ${trade.display_plural} in ${city.display_name} and ${city.nearby.slice(0, 2).join(', ')}. $149/mo flat, unlimited calls, no setup fee.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://ringbyring.ai/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { trade, city } = parsed;

  return <TradeCityPage trade={trade} city={city} />;
}
