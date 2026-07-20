import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import tradesData from '@/data/trades.json';
import { TradePage } from '@/components/seo';
import type { Trade } from '@/types';

interface PageProps {
  params: Promise<{
    tradeService: string;
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

  return trades.map((trade) => ({
    tradeService: `${trade.slug}-answering-service`,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tradeSlug = parseTradeService(resolvedParams.tradeService);

  if (!tradeSlug) {
    return { title: 'Not Found' };
  }

  const trades = tradesData.trades as Trade[];
  const trade = trades.find((t) => t.slug === tradeSlug);

  if (!trade) {
    return { title: 'Not Found' };
  }

  const title = `${trade.display_name} Answering Service | RingByRing`;
  const description = `24/7 AI answering service for ${trade.display_plural}. Never miss a call again. $149/month flat rate, unlimited calls. Set up in 15 minutes.`;

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
  const trade = trades.find((t) => t.slug === tradeSlug);

  if (!trade) {
    notFound();
  }

  return <TradePage trade={trade} />;
}
