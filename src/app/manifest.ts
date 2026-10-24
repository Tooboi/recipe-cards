import type { MetadataRoute } from "next";

/** Makes the site installable ("Add to Home Screen" / Install app). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/me",
    name: "Recipe Card Vault",
    short_name: "Recipe Vault",
    description: "Your family recipes, kept safe and ready to cook from — even offline.",
    // The installed app opens straight to your own recipes.
    start_url: "/me",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf6ef",
    theme_color: "#ffffff",
    categories: ["food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Add a recipe", short_name: "Add", url: "/new-recipe" },
      { name: "Saved recipes", short_name: "Saved", url: "/me?tab=saved" },
    ],
  };
}
