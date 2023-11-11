import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Currency formatter for numbers
 * @param number
 * @returns number formatted in AUD
 */
const formatCurrency = (number: number, decimals: boolean = true) =>
  Intl.NumberFormat('default', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: decimals ? undefined : 0,
  })
    .format(number)
    .toString();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatCurrency };
