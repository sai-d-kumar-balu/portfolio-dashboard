export type NullableNumber = number | null;
export type NullableString = string | null;

export interface Holding {
  id: number;
  name: string;
  sector: string;
  purchasePrice: NullableNumber;
  quantity: NullableNumber;
  investment: NullableNumber;
  portfolioWeight: NullableNumber;
  ticker: NullableString | number;
  cmp: NullableNumber;
  presentValue: NullableNumber;
  gainLoss: NullableNumber;
  gainLossPct: NullableNumber;
  marketCap: NullableNumber;
  peRatio: NullableNumber;
  latestEarnings: NullableNumber;
  revenueTtm: NullableNumber;
  ebitdaTtm: NullableNumber;
  ebitdaMargin: NullableNumber;
  pat: NullableNumber;
  patMargin: NullableNumber;
  cfoRecent: NullableNumber;
  cfoFiveYear: NullableNumber;
  fcfFiveYear: NullableNumber;
  debtToEquity: NullableNumber;
  bookValue: NullableNumber;
  growthRevenue: NullableNumber;
  growthEbitda: NullableNumber;
  growthProfit: NullableNumber;
  growthMarketCap: NullableNumber;
  priceToSales: NullableNumber;
  cfoToEbitda: NullableNumber;
  cfoToPat: NullableNumber;
  priceToBook: NullableNumber;
  stage2: NullableString;
  salePrice: NullableNumber;
  notes: NullableString;
}

export interface PortfolioSnapshot {
  updatedAt: string;
  currency: string;
  holdings: Holding[];
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  weight: number;
}

