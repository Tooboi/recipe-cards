// Serves /ads.txt, which AdSense checks to confirm you own this site's ad space.
import { ADS, adsEnabled } from "@/lib/ads";

export function GET() {
  const body = adsEnabled
    ? `google.com, ${ADS.client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "# Ads are not set up yet.\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
