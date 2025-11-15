import portfolioSnapshot from '@/data/portfolio.json';

import type { Holding, PortfolioSnapshot, SectorSummary } from '@/types/portfolio';

const snapshot = portfolioSnapshot as PortfolioSnapshot;

export function getPortfolio(): PortfolioSnapshot {
  return snapshot;
}

export function getSectorSummaries(): SectorSummary[] {
  const sectors = new Map<string, SectorSummary>();

  snapshot.holdings.forEach((holding) => {
    if (!holding.sector) {
      return;
    }

    const investment = holding.investment ?? 0;
    const presentValue = holding.presentValue ?? 0;
    const gainLoss = presentValue - investment;
    const weight = holding.portfolioWeight ?? 0;

    const summary = sectors.get(holding.sector) ?? {
      sector: holding.sector,
      totalInvestment: 0,
      totalPresentValue: 0,
      gainLoss: 0,
      weight: 0,
    };

    summary.totalInvestment += investment;
    summary.totalPresentValue += presentValue;
    summary.gainLoss += gainLoss;
    summary.weight += weight;

    sectors.set(holding.sector, summary);
  });

  return Array.from(sectors.values()).sort((a, b) => b.totalInvestment - a.totalInvestment);
}

export function getHoldingByTicker(ticker: Holding['ticker']): Holding | undefined {
  return snapshot.holdings.find((holding) => holding.ticker === ticker);
}

