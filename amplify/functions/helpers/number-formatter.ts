export function formatToMZN(number: number): string {
  const formattedNumber = new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN', currencyDisplay: 'symbol' }).format(number);
  const formatted = formattedNumber.replace('MTn', 'MT')
  return formatted;
}

interface NumberFormatterOptions {
  K: string;
  M: string;
  B: string;
}

export function formatNumber(num: number, decimals: number = 1, symbols: NumberFormatterOptions = { K: 'K', M: 'M', B: 'B' }): string {
  const THOUSAND = 1e3;
  const MILLION = 1e6;
  const BILLION = 1e9;

  if (num >= BILLION) {
    return (num / BILLION).toFixed(decimals) + symbols.B;
  } else if (num >= MILLION) {
    return (num / MILLION).toFixed(decimals) + symbols.M;
  } else if (num >= THOUSAND) {
    return (num / THOUSAND).toFixed(decimals) + symbols.K;
  } else {
    return num.toString();
  }
}
