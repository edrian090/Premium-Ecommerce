import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseImages(imagesStr: string | any): string[] {
  if (Array.isArray(imagesStr)) {
    return imagesStr.map(cleanImageUrl).filter(Boolean);
  }
  
  let result: string[] = [];
  try {
    const parsed = JSON.parse(imagesStr || "[]");
    result = Array.isArray(parsed) ? parsed : [parsed];
  } catch (_e) {
    if (typeof imagesStr === "string" && imagesStr.trim().length > 0) {
      result = [imagesStr];
    }
  }
  
  return result.map(cleanImageUrl).filter(Boolean);
}

function cleanImageUrl(img: any): string {
  if (typeof img !== "string") return "";
  let clean = img.trim();
  
  while (
    (clean.startsWith("{") && clean.endsWith("}")) ||
    (clean.startsWith("[") && clean.endsWith("]")) ||
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  
  return clean;
}

