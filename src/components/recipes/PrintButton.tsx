"use client";

import { PrinterIcon } from "@heroicons/react/24/outline";

export default function PrintButton() {
  return (
    <button type="button" className="btn-outline" onClick={() => window.print()}>
      <PrinterIcon className="h-4 w-4" />
      Print
    </button>
  );
}
