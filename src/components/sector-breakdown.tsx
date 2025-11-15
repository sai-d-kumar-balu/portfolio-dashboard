'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type PieDatum = Record<string, string | number>;

import { formatCurrency, formatPercent } from '@/lib/format';
import type { SectorSummary } from '@/types/portfolio';

interface SectorBreakdownProps {
  sectors: SectorSummary[];
  currency: string;
}

export function SectorBreakdown({ sectors, currency }: SectorBreakdownProps) {
  if (sectors.length === 0) return null;

  const colors = [
    '#2563EB',
    '#0EA5E9',
    '#10B981',
    '#FBBF24',
    '#F97316',
    '#EC4899',
    '#8B5CF6',
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4 flex flex-col gap-1">
        <div>
          <p className="text-sm font-semibold text-slate-500">Sector Allocation</p>
          <p className="text-xs text-slate-400">Totals aggregate live gain/loss</p>
        </div>
      </header>
      <div className="flex flex-col gap-4 lg:flex-col">
        <div className="h-48 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={sectors.map((sector) => ({ ...sector })) as PieDatum[]}
                dataKey="totalPresentValue"
                nameKey="sector"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {sectors.map((entry, index) => (
                  <Cell key={entry.sector} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value, currency)}
                labelFormatter={(label) => label}
                contentStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="divide-y divide-slate-100">
          {sectors.map((sector, index) => (
            <div key={sector.sector} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{sector.sector}</p>
                  <p className="text-xs text-slate-500">
                    {formatPercent(sector.weight)} allocation
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(sector.totalPresentValue, currency)}
                </p>
                <p
                  className={`text-xs ${
                    sector.gainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(sector.gainLoss, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

