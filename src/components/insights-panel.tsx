 'use client';

import { useState } from 'react';
import { clsx, formatCurrency, formatPercent } from '@/lib/format';
import type { Holding } from '@/types/portfolio';

interface InsightsPanelProps {
  holdings: Holding[];
  currency: string;
}

export function InsightsPanel({ holdings, currency }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<'movers' | 'watch'>('movers');
  const sortable = holdings.filter(
    (holding) =>
      holding.gainLossPct !== null &&
      holding.gainLossPct !== undefined &&
      !Number.isNaN(holding.gainLossPct),
  );

  const topGainers = [...sortable]
    .sort((a, b) => (b.gainLossPct ?? 0) - (a.gainLossPct ?? 0))
    .slice(0, 3);

  const topLosers = [...sortable]
    .sort((a, b) => (a.gainLossPct ?? 0) - (b.gainLossPct ?? 0))
    .slice(0, 3);

  const stageTwo = holdings.filter(
    (holding) => String(holding.stage2 ?? '').toLowerCase() === 'yes',
  );
  const exitList = holdings.filter((holding) =>
    String(holding.notes ?? '').toLowerCase().includes('exit'),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Insights
        </h2>
        <div className="flex rounded-full border border-slate-200 p-1 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab('movers')}
            className={clsx(
              'rounded-full px-3 py-1 transition',
              activeTab === 'movers' ? 'bg-indigo-50 text-indigo-600' : '',
            )}
          >
            Movers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watch')}
            className={clsx(
              'rounded-full px-3 py-1 transition',
              activeTab === 'watch' ? 'bg-indigo-50 text-indigo-600' : '',
            )}
          >
            Watchlists
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-5">
        {activeTab === 'movers' ? (
          <>
            <div>
              <p className="text-xs font-semibold text-slate-400">Top Movers (Gain)</p>
              <ul className="mt-2 space-y-2">
                {topGainers.map((holding) => (
                  <li key={`gainer-${holding.id}`} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{holding.name}</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatPercent(holding.gainLossPct)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Top Movers (Loss)</p>
              <ul className="mt-2 space-y-2">
                {topLosers.map((holding) => (
                  <li key={`loser-${holding.id}`} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{holding.name}</span>
                    <span className="text-sm font-semibold text-rose-600">
                      {formatPercent(holding.gainLossPct)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold text-slate-400">Stage-2 Monitoring</p>
              <ul className="mt-2 space-y-1">
                {stageTwo.length === 0 ? (
                  <li className="text-xs text-slate-400">No Stage-2 holdings.</li>
                ) : (
                  stageTwo.map((holding) => (
                    <li key={`stage2-${holding.id}`} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{holding.name}</span>
                      <span className="text-xs text-slate-400">
                        {formatCurrency(holding.presentValue ?? holding.investment, currency)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Exit / Alert List</p>
              <ul className="mt-2 space-y-1">
                {exitList.length === 0 ? (
                  <li className="text-xs text-slate-400">No exit alerts flagged.</li>
                ) : (
                  exitList.map((holding) => (
                    <li key={`exit-${holding.id}`} className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{holding.name}</span>
                      <span className="text-xs text-slate-400">{holding.notes}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

