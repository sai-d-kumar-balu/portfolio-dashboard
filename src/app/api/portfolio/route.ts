import { NextResponse } from 'next/server';

import { getPortfolio, getSectorSummaries } from '@/lib/portfolio';

export async function GET() {
  const portfolio = getPortfolio();
  const sectors = getSectorSummaries();

  return NextResponse.json({
    portfolio,
    sectors,
  });
}

