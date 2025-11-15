'use client';

import { useMemo, useState } from 'react';

import { clsx, formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import type { Holding } from '@/types/portfolio';

import { useMarketData } from '@/hooks/useMarketData';

const PAGE_SIZE = 8;

const sorters: Record<'name' | 'investment' | 'gain', (a: Holding, b: Holding) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  investment: (a, b) => (b.investment ?? 0) - (a.investment ?? 0),
  gain: (a, b) => (b.gainLoss ?? 0) - (a.gainLoss ?? 0),
};

interface HoldingsTableProps {
  holdings: Holding[];
  currency: string;
}

function Stat({
  label,
  value,
  subValue,
  align = 'start',
}: {
  label: string;
  value: string;
  subValue?: string;
  align?: 'start' | 'end';
}) {
  return (
    <div className={clsx('text-sm', align === 'end' ? 'text-right' : 'text-left')}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
      {subValue ? <p className="text-xs text-slate-500">{subValue}</p> : null}
    </div>
  );
}

function HoldingRow({ holding, currency }: { holding: Holding; currency: string }) {
  const { data, isLoading } = useMarketData(holding.ticker);
  const quote = data?.marketData?.quote;
  const fundamentals = data?.marketData?.fundamentals;

  const cmp = quote?.price ?? holding.cmp;
  const presentValue = cmp && holding.quantity ? cmp * holding.quantity : holding.presentValue;
  const gainLoss =
    presentValue !== null && holding.investment !== null
      ? presentValue - holding.investment
      : holding.gainLoss;
  const gainLossPct =
    gainLoss !== null && holding.investment
      ? gainLoss / holding.investment
      : holding.gainLossPct;

  const gainClass =
    gainLoss !== null && gainLoss >= 0 ? 'text-emerald-600' : gainLoss !== null ? 'text-rose-600' : 'text-slate-600';

  return (
    <div className="rounded-xl border border-slate-100 bg-white/80 p-4 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-indigo-100 hover:ring-indigo-50">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-slate-900">{holding.name}</p>
            {holding.notes ? (
              <span className="rounded-full bg-indigo-50 px-2 py-[1px] text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                {holding.notes}
              </span>
            ) : null}
            {holding.stage2?.toLowerCase() === 'yes' ? (
              <span className="rounded-full bg-amber-50 px-2 py-[1px] text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                Stage-2
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500">{holding.sector}</p>
        </div>
        <div className="text-xs text-slate-400">
          {holding.ticker}
          {data?.symbols ? (
            <span className="ml-1 rounded-full border border-slate-200 px-2 py-[1px] text-[10px] uppercase text-slate-500">
              {data.symbols.exchange}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Purchase" value={formatCurrency(holding.purchasePrice, currency)} />
          <Stat
            label="Quantity"
            value={formatNumber(holding.quantity, 0)}
            subValue={`Portfolio ${formatPercent(holding.portfolioWeight)}`}
          />
          <Stat
            label="Investment"
            value={formatCurrency(holding.investment, currency)}
            subValue={formatCurrency(presentValue ?? null, currency)}
          />
          <Stat
            label="CMP"
            value={formatCurrency(cmp, currency)}
            subValue={isLoading ? 'refreshing…' : 'live'}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={clsx('rounded-2xl border border-slate-100 p-3 text-sm', gainClass)}>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Gain / Loss</p>
            <p className="text-lg font-semibold">{formatCurrency(gainLoss ?? null, currency)}</p>
            <p className="text-xs">{formatPercent(gainLossPct)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-3 text-sm text-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Valuation</p>
            <p className="text-lg font-semibold">{formatNumber(fundamentals?.peRatio ?? holding.peRatio)}</p>
            <p className="text-xs text-slate-500">
              EPS {formatNumber(fundamentals?.latestEarnings ?? holding.latestEarnings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HoldingsTable({ holdings, currency }: HoldingsTableProps) {
  const [page, setPage] = useState(0);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageTwoOnly, setStageTwoOnly] = useState(false);
  const [onlyGainers, setOnlyGainers] = useState(false);
  const [onlyExits, setOnlyExits] = useState(false);
  const [sortKey, setSortKey] = useState<keyof typeof sorters>('investment');

  const sectors = useMemo(() => {
    const unique = new Set<string>(['All']);
    holdings.forEach((holding) => {
      if (holding.sector) unique.add(holding.sector);
    });
    return Array.from(unique);
  }, [holdings]);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return [...holdings]
      .filter((holding) => {
        if (stageTwoOnly && String(holding.stage2 ?? '').toLowerCase() !== 'yes') return false;
        if (onlyGainers && (holding.gainLoss ?? 0) <= 0) return false;
        if (onlyExits && !String(holding.notes ?? '').toLowerCase().includes('exit')) return false;
        if (sectorFilter !== 'All' && holding.sector !== sectorFilter) return false;
        if (term) {
          const haystack = `${holding.name} ${holding.ticker}`.toLowerCase();
          if (!haystack.includes(term)) return false;
        }
        return true;
      })
      .sort(sorters[sortKey])
      .map((holding) => ({
        sector: holding.sector || 'Uncategorized',
        holding,
      }));
  }, [holdings, sectorFilter, searchTerm, stageTwoOnly, onlyGainers, onlyExits, sortKey]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * PAGE_SIZE;
  const pagedRows = rows.slice(start, start + PAGE_SIZE);

  const goToPage = (newPage: number) => {
    setPage(Math.max(0, Math.min(totalPages - 1, newPage)));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Holdings</p>
          <p className="text-xs text-slate-400">{rows.length} matching positions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Prev
          </button>
          <span className="text-slate-500">
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or ticker"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(0);
              }}
              className="h-10 rounded-full border border-slate-200 bg-white pl-4 pr-10 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
            <span className="text-xs uppercase tracking-wide text-slate-400">Sector</span>
            <div className="flex gap-1">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => {
                    setSectorFilter(sector);
                    setPage(0);
                  }}
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-semibold transition',
                    sectorFilter === sector
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-500 hover:bg-slate-100',
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold text-slate-500">
            {(['investment', 'gain', 'name'] as Array<keyof typeof sorters>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSortKey(key);
                  setPage(0);
                }}
                className={clsx(
                  'rounded-full px-3 py-1 transition',
                  sortKey === key ? 'bg-indigo-50 text-indigo-600' : '',
                )}
              >
                {key === 'investment' ? 'Investment' : key === 'gain' ? 'Gain' : 'Name'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setStageTwoOnly(!stageTwoOnly);
            setPage(0);
          }}
          className={clsx(
            'rounded-full border px-3 py-1 font-semibold',
            stageTwoOnly ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500',
          )}
        >
          Stage-2 only
        </button>
        <button
          type="button"
          onClick={() => {
            setOnlyGainers(!onlyGainers);
            setPage(0);
          }}
          className={clsx(
            'rounded-full border px-3 py-1 font-semibold',
            onlyGainers ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500',
          )}
        >
          Show gainers
        </button>
        <button
          type="button"
          onClick={() => {
            setOnlyExits(!onlyExits);
            setPage(0);
          }}
          className={clsx(
            'rounded-full border px-3 py-1 font-semibold',
            onlyExits ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500',
          )}
        >
          Show exits
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        {pagedRows.map(({ sector, holding }) => (
          <HoldingRow
            key={`${sector}-${holding.id}-${holding.name}`}
            holding={holding}
            currency={currency}
          />
        ))}
      </div>

      <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>
          Showing {start + 1} – {Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}
        </span>
        <div className="flex items-center gap-2">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={`page-${idx}`}
              type="button"
              onClick={() => goToPage(idx)}
              className={clsx(
                'h-7 w-7 rounded-full border text-xs font-semibold',
                idx === currentPage
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                  : 'border-slate-200 text-slate-500',
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </footer>
    </section>
  );
}

