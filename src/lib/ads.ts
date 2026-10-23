// Google AdSense settings, all from environment variables (set them in .env and in Vercel).
// With no client ID set, ads are switched off and the site renders exactly as before.

export const ADS = {
  /** "ca-pub-1234567890123456" from AdSense → Account → Account information */
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "",
  /** In-feed ad unit (cards in recipe grids): slot id + layout key from AdSense's "Get code" */
  infeedSlot: process.env.NEXT_PUBLIC_ADSENSE_INFEED_SLOT?.trim() || "",
  infeedLayoutKey: process.env.NEXT_PUBLIC_ADSENSE_INFEED_LAYOUT_KEY?.trim() || "",
  /** Display ad unit (below a recipe's directions) */
  recipeSlot: process.env.NEXT_PUBLIC_ADSENSE_RECIPE_SLOT?.trim() || "",
};

export const adsEnabled = /^ca-pub-\d+$/.test(ADS.client);
export const infeedEnabled = adsEnabled && !!ADS.infeedSlot && !!ADS.infeedLayoutKey;
export const recipeAdEnabled = adsEnabled && !!ADS.recipeSlot;

/** Grid positions (0-based) that hold an ad card instead of a recipe. Never the first card. */
export const BROWSE_AD_POSITIONS = [5, 11]; // 2 per page of 12: end of row 2 and row 4 on desktop
export const HOME_AD_POSITIONS = [4]; // middle of the second row (comfortable, 3 across)
export const HOME_AD_POSITIONS_COMPACT = [5]; // second card of the second row (compact, 4 across)
