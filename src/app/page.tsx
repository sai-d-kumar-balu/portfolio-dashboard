'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

import { HoldingsTable } from '@/components/holdings-table';
import { InsightsPanel } from '@/components/insights-panel';
import { LoadingState } from '@/components/loading-state';
import { SectorBreakdown } from '@/components/sector-breakdown';
import { SummaryCards } from '@/components/summary-cards';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function Home() {
  const { portfolio, sectors, isLoading, isError } = usePortfolio();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10 xl:px-12">
        <motion.header
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Live Portfolio Monitor
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
              Dynamic Portfolio Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 lg:text-base">
              CMP, gain/loss, and valuation metrics refresh every 15 seconds. Built with Next.js,
              Tailwind, and live Yahoo/Google Finance integrations using Yahoo/Google scraping
              fallbacks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Auto-refresh 15s / 60s
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1">
              Currency: INR
            </span>
            <Link className="rounded-full border border-indigo-100 px-4 py-1 text-indigo-600" href="https://www.8byte.ai/" target="_blank">
              About 8byte
            </Link>
          </div>
        </motion.header>

        {isLoading ? <LoadingState /> : null}

        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            Failed to load initial data. Please try again or check your connection.
          </div>
        )}

        {portfolio ? (
          <>
            <SummaryCards portfolio={portfolio} />

            <motion.div
              className="grid gap-6 xl:grid-cols-[3fr_1.3fr]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <HoldingsTable holdings={portfolio.holdings} currency={portfolio.currency} />
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <SectorBreakdown sectors={sectors} currency={portfolio.currency} />
                <InsightsPanel holdings={portfolio.holdings} currency={portfolio.currency} />
              </motion.div>
            </motion.div>

            <footer className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Last updated: {new Date(portfolio.updatedAt).toLocaleString()}</span>
              <span>•</span>
              <span>Data sources: Excel seed + Yahoo/Google (scraping)</span>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
