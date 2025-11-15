import useSWR from 'swr';

import type { MarketSnapshot, SymbolMapping } from '@/lib/market-data';

interface MarketResponse {
  ticker: string;
  symbols: SymbolMapping;
  marketData: MarketSnapshot | null;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return (await response.json()) as MarketResponse;
};

export function useMarketData(ticker: string | number | null | undefined) {
  const normalisedTicker = ticker ? String(ticker).toUpperCase() : null;
  const { data, error, isLoading } = useSWR<MarketResponse>(
    normalisedTicker ? `/api/market/${encodeURIComponent(normalisedTicker)}` : null,
    fetcher,
    {
      refreshInterval: 15_000,
      dedupingInterval: 5_000,
    },
  );

  return {
    data,
    isLoading,
    isError: Boolean(error),
  };
}

