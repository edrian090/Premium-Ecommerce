import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseImages(imagesStr: string | any): string[] {
  if (Array.isArray(imagesStr)) return imagesStr;
  try {
    return JSON.parse(imagesStr || "[]");
  } catch (_e) {
    if (typeof imagesStr === "string" && imagesStr.length > 0) return [imagesStr];
    return [];
  }
}

