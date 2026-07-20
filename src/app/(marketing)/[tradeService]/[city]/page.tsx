import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import tradesData from '@/data/trades.json';
import citiesData from '@/data/cities.json';
import metaData from '@/data/meta.json';
import { TradeCityPage } from '@/components/seo';
import type { Trade, City } from '@/types';

interface PageProps {
  params: Promise<{
    tradeService: string;
    city: string;
  }>;
}

// Parse tradeService param (e.g., "plumber-answering-service") to get trade slug
function parseTradeService(tradeService: string): string | null {
  const suffix = '-answering-service';
  if (tradeService.endsWith(suffix)) {
    return tradeService.slice(0, -suffix.length);
  }
  return null;
}

export async function generateStaticParams() {
  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];
  const params: { tradeService: string; city: string }[] = [];

  for (const trade of trades) {
    for (const city of cities) {
      params.push({
        tradeService: `${trade.slug}-answering-service`,
        city: city.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tradeSlug = parseTradeService(resolvedParams.tradeService);

  if (!tradeSlug) {
    return { title: 'Not Found' };
  }

  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];

  const trade = trades.find((t) => t.slug === tradeSlug);
  const city = cities.find((c) => c.slug === resolvedParams.city);

  if (!trade || !city) {
    return { title: 'Not Found' };
  }

  // Use patterns from meta.json
  const title = metaData.title_pattern
    .replace('{trade}', trade.display_name)
    .replace('{city}', city.display_name);

  const description = metaData.meta_description_pattern
    .replace('{trade}', trade.display_plural.toLowerCase())
    .replace('{city}', city.display_name);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const tradeSlug = parseTradeService(resolvedParams.tradeService);

  if (!tradeSlug) {
    notFound();
  }

  const trades = tradesData.trades as Trade[];
  const cities = citiesData.cities as City[];

  const trade = trades.find((t) => t.slug === tradeSlug);
  const city = cities.find((c) => c.slug === resolvedParams.city);

  if (!trade || !city) {
    notFound();
  }

  return <TradeCityPage trade={trade} city={city} />;
}
