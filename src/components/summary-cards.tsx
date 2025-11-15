'use client';

import { Dialog } from '@headlessui/react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { formatCurrency, formatPercent } from '@/lib/format';
import type { PortfolioSnapshot } from '@/types/portfolio';

interface CardDetails {
  title: string;
  description: string;
  items: { label: string; value: string; subValue?: string }[];
}

type CardSummary = {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'positive' | 'negative';
};

function buildDetails(
  card: CardSummary,
  portfolio: PortfolioSnapshot,
): CardDetails {
  const topHoldings = [...portfolio.holdings]
    .filter((holding) => holding.investment)
    .sort((a, b) => (b.investment ?? 0) - (a.investment ?? 0))
    .slice(0, 5);

  if (card.label === 'Gain / Loss') {
    return {
      title: 'Gain / Loss Insight',
      description:
        'Top movers driving the current P&L. Values reflect live CMP when available, falling back to Excel data.',
      items: topHoldings.map((holding) => ({
        label: holding.name,
        value: formatCurrency(holding.gainLoss ?? 0, portfolio.currency),
        subValue: formatPercent(holding.gainLossPct),
      })),
    };
  }

  return {
    title: `${card.label} Breakdown`,
    description: 'Top holdings contributing to this figure.',
    items: topHoldings.map((holding) => ({
      label: holding.name,
      value: formatCurrency(
        card.label === 'Current Value' ? holding.presentValue ?? 0 : holding.investment ?? 0,
        portfolio.currency,
      ),
      subValue: `${formatPercent(holding.portfolioWeight)} of portfolio`,
    })),
  };
}

const cardsConfig = (
  portfolio: PortfolioSnapshot,
  totals: { invested: number; current: number },
  gainLoss: number,
  gainPct: number,
): CardSummary[] => [
  {
    label: 'Total Investment',
    value: formatCurrency(totals.invested, portfolio.currency),
  },
  {
    label: 'Current Value',
    value: formatCurrency(totals.current, portfolio.currency),
  },
  {
    label: 'Gain / Loss',
    value: formatCurrency(gainLoss, portfolio.currency),
    subValue: formatPercent(gainPct),
    trend: gainLoss >= 0 ? 'positive' : 'negative',
  },
];

interface SummaryCardsProps {
  portfolio?: PortfolioSnapshot;
}

export function SummaryCards({ portfolio }: SummaryCardsProps) {
  const [activeCard, setActiveCard] = useState<CardDetails | null>(null);

  if (!portfolio) return null;

  const totals = portfolio.holdings.reduce(
    (acc, holding) => {
      const investment = holding.investment ?? 0;
      const present = holding.presentValue ?? 0;
      return {
        invested: acc.invested + investment,
        current: acc.current + present,
      };
    },
    { invested: 0, current: 0 },
  );

  const gainLoss = totals.current - totals.invested;
  const gainPct = totals.invested ? gainLoss / totals.invested : 0;

  const cards = cardsConfig(portfolio, totals, gainLoss, gainPct);

  return (
    <>
      <motion.section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1, duration: 0.4 },
          },
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            whileHover={{ scale: 1.01 }}
            onClick={() => setActiveCard(buildDetails(card, portfolio))}
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            {card.subValue ? (
              <p
                className={`mt-1 text-sm font-semibold ${
                  card.trend === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {card.subValue}
              </p>
            ) : null}
          </motion.div>
        ))}
      </motion.section>

      <Dialog open={Boolean(activeCard)} onClose={() => setActiveCard(null)} className="relative z-50">
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-slate-900">
              {activeCard?.title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-500">
              {activeCard?.description}
            </Dialog.Description>
            <ul className="mt-4 divide-y divide-slate-100">
              {activeCard?.items.map((item) => (
                <li key={item.label} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    {item.subValue ? <p className="text-xs text-slate-500">{item.subValue}</p> : null}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                onClick={() => setActiveCard(null)}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

