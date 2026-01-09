import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNights(count: number): string {
  if (count === 1) return '1 noc';
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return `${count} noce`;
  }
  return `${count} nocy`;
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except initial '+'
  const cleaned = value.replace(/(?!^\+)[^\d]/g, '');
  
  // If no digits, return empty
  if (!cleaned) return '';

  // If it starts with +, keep it separate
  const hasPlus = cleaned.startsWith('+');
  const digits = hasPlus ? cleaned.slice(1) : cleaned;
  
  const chunks = digits.match(/.{1,3}/g) || [];
  
  const formatted = chunks.join(' ');
  
  
  return hasPlus ? `+${formatted}` : formatted;
}

export function formatZipCode(value: string): string {
  const cleaned = value.replace(/\D/g, '');

  if (!cleaned) return '';

  const truncated = cleaned.slice(0, 5);

  if (truncated.length > 2) {
    return `${truncated.slice(0, 2)}-${truncated.slice(2)}`;
  }
  
  return truncated;
}
