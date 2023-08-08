/**
 * Currency formatter for numbers
 * @param number
 * @returns number formatted in AUD
 */
const formatCurrency = (number: number) =>
  Intl.NumberFormat('default', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
  })
    .format(number)
    .toString();

export { formatCurrency };
