import { load } from 'cheerio';

import type { Holding } from '@/types/portfolio';

const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const GOOGLE_FINANCE_URL = 'https://www.google.com/finance/quote';

export interface QuoteResult {
  source: 'yahoo';
  symbol: string;
  price: number | null;
  currency: string | null;
  changePercent: number | null;
  updatedAt: string;
}

export interface FundamentalsResult {
  source: 'google';
  symbol: string;
  peRatio: number | null;
  latestEarnings: number | null;
  updatedAt: string;
}

export interface MarketSnapshot {
  quote: QuoteResult;
  fundamentals: FundamentalsResult;
}

export interface SymbolMapping {
  raw: string;
  yahooSymbol: string;
  googleSymbol: string;
  exchange: 'NSE' | 'BSE';
}

export function resolveSymbols(ticker: Holding['ticker']): SymbolMapping | null {
  if (!ticker) {
    return null;
  }

  if (typeof ticker === 'number' || /^[0-9]+$/.test(String(ticker))) {
    const base = String(ticker);
    return {
      raw: base,
      yahooSymbol: `${base}.BO`,
      googleSymbol: `${base}:BOM`,
      exchange: 'BSE',
    };
  }

  const clean = String(ticker).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!clean) {
    return null;
  }

  return {
    raw: clean,
    yahooSymbol: `${clean}.NS`,
    googleSymbol: `${clean}:NSE`,
    exchange: 'NSE',
  };
}

export async function fetchYahooQuote(symbol: string): Promise<QuoteResult> {
  const url = `${YAHOO_QUOTE_URL}?symbols=${encodeURIComponent(symbol)}`;
  const response = await fetch(url, { next: { revalidate: 15 } });

  if (!response.ok) {
    throw new Error(`Yahoo Finance quote failed (${response.status})`);
  }

  const data = await response.json();
  const result = data?.quoteResponse?.result?.[0];

  return {
    source: 'yahoo',
    symbol,
    price: result?.regularMarketPrice ?? null,
    currency: result?.currency ?? null,
    changePercent: result?.regularMarketChangePercent ?? null,
    updatedAt: new Date().toISOString(),
  };
}

function extractNumber(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/,/g, '');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function fetchGoogleFundamentals(symbol: string): Promise<FundamentalsResult> {
  const url = `${GOOGLE_FINANCE_URL}/${encodeURIComponent(symbol)}?hl=en`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (assignment prototype)' },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Google Finance fetch failed (${response.status})`);
  }

  const html = await response.text();
  const $ = load(html);
  const peRatio = extractNumber($('[data-snapfield=\"PE_RATIO\"]').first().text());
  const latestEarnings = extractNumber($('[data-snapfield=\"EPS\"]').first().text());

  return {
    source: 'google',
    symbol,
    peRatio,
    latestEarnings,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchMarketSnapshot(holding: Holding): Promise<MarketSnapshot | null> {
  const mapping = resolveSymbols(holding.ticker);
  if (!mapping) {
    return null;
  }

  const [quote, fundamentals] = await Promise.all([
    fetchYahooQuote(mapping.yahooSymbol),
    fetchGoogleFundamentals(mapping.googleSymbol),
  ]);

  return { quote, fundamentals };
}

