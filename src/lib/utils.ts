import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeTo12h(timeStr: string) {
  if (!timeStr) return { time: '', period: '' };
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return {
    time: `${hours12}:${minutes.toString().padStart(2, '0')}`,
    period
  };
}
