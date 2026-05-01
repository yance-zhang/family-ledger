import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (Shadcn UI convention) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
