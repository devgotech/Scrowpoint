import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our custom design tokens (app/globals.css @theme),
 * otherwise it treats `text-caption` as a colour and drops `text-ink` (or vice
 * versa) when both appear in one cn() call. Keep these lists in sync with the
 * --text-* and --radius-* tokens in globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "caption", "meta", "label"],
      radius: ["ui", "card", "control", "badge"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
