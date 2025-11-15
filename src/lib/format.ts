export function formatCurrency(value: number | null | undefined, currency = 'INR') {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '–';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '–';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '–';
  }
  return `${(value * 100).toFixed(digits)}%`;
}

export function clsx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

