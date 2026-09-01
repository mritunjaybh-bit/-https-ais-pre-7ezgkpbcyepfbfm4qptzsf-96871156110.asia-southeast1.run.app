import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/coffeeData';

export function formatPrice(amountInINR: number, currency: Currency = 'INR'): string {
  const config = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
  const converted = amountInINR * config.rate;

  switch (currency) {
    case 'INR':
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    case 'USD':
      return `$${converted.toFixed(2)}`;
    case 'EUR':
      return `€${converted.toFixed(2)}`;
    case 'GBP':
      return `£${converted.toFixed(2)}`;
    case 'AED':
      return `AED ${converted.toFixed(1)}`;
    case 'SGD':
      return `S$${converted.toFixed(2)}`;
    case 'VND':
      return `${Math.round(converted).toLocaleString('en-US')} ₫`;
    default:
      return `₹${Math.round(amountInINR).toLocaleString('en-IN')}`;
  }
}

