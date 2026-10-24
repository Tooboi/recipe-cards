"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { parseScale, withScale } from "@/lib/scale";

/** A link that keeps the recipe's current ?scale= (set by the ingredient scaler). */
export default function ScaledLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const factor = parseScale(useSearchParams().get("scale"));
  return (
    <Link href={withScale(href, factor)} className={className}>
      {children}
    </Link>
  );
}
