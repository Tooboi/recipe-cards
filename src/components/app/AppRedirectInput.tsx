"use client";

import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/app-mode";

/** Hidden field: after Google/GitHub sign-in, the installed app returns to your recipes. */
export default function AppRedirectInput() {
  const [app, setApp] = useState(false);
  useEffect(() => setApp(isStandalone()), []);
  return app ? <input type="hidden" name="redirectTo" value="/me" /> : null;
}
