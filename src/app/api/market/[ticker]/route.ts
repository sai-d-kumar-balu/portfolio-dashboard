import { NextResponse } from 'next/server';

import { fetchMarketSnapshot, resolveSymbols } from '@/lib/market-data';
import { getPortfolio } from '@/lib/portfolio';

interface RouteParams {
  params: Promise<{
    ticker: string;
  }>;
}

export async function GET(_request: Request, context: RouteParams) {
  const { ticker } = await context.params;
  const portfolio = getPortfolio();
  const decodedTicker = decodeURIComponent(ticker);
  const holding = portfolio.holdings.find(
    (item) => String(item.ticker).toUpperCase() === decodedTicker.toUpperCase(),
  );

  if (!holding) {
    return NextResponse.json(
      { error: `Unknown ticker ${decodedTicker}` },
      { status: 404 },
    );
  }

  const symbols = resolveSymbols(holding.ticker);
  if (!symbols) {
    return NextResponse.json(
      { error: `Ticker ${decodedTicker} does not have a valid exchange mapping` },
      { status: 400 },
    );
  }

  try {
    const marketData = await fetchMarketSnapshot(holding);
    return NextResponse.json({
      ticker: decodedTicker,
      symbols,
      marketData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 502 },
    );
  }
}

