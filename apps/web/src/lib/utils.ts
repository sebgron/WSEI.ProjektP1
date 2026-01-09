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
