import useSWR from 'swr';

import type { PortfolioSnapshot, SectorSummary } from '@/types/portfolio';

interface PortfolioResponse {
  portfolio: PortfolioSnapshot;
  sectors: SectorSummary[];
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return (await response.json()) as PortfolioResponse;
};

export function usePortfolio() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    '/api/portfolio',
    fetcher,
    {
      refreshInterval: 60_000,
    },
  );

  return {
    portfolio: data?.portfolio,
    sectors: data?.sectors ?? [],
    isLoading,
    isError: Boolean(error),
    mutate,
  };
}

