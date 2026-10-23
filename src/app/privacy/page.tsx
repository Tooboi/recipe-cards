import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy" };

// Plain-language starter policy. Review it, and add your contact email where marked.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="eyebrow mb-1">Recipe Card Vault</p>
      <h1 className="font-serif text-4xl font-bold text-ink">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-ink [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_a]:text-brand [&_a]:underline">
        <section>
          <h2>What we collect</h2>
          <p className="mt-2">
            When you create an account we store your username, email address, an optional profile
            picture, and a securely hashed password (or your Google/GitHub sign-in). We also store the
            recipes, photos, ratings and saved recipes you add. Private recipes are only shown to you.
          </p>
        </section>

        <section>
          <h2>Cookies and similar storage</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>A sign-in cookie that keeps you logged in.</li>
            <li>Your light/dark theme and layout choices, saved in your browser.</li>
            <li>Vercel Analytics, which counts page views without using cookies or tracking you across sites.</li>
            <li>Advertising cookies from Google, described below.</li>
          </ul>
        </section>

        <section>
          <h2>Advertising</h2>
          <p className="mt-2">
            Some pages show ads served by Google AdSense. Google and its partners use cookies to show
            ads based on your visits to this and other websites. You can learn how Google uses this
            information at{" "}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">
              How Google uses information from sites that use its services
            </a>
            , and turn off personalized ads in{" "}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener">
              Google&apos;s Ad Settings
            </a>
            . Visitors in the EEA, UK and Switzerland are asked for consent before personalized ads are shown.
          </p>
        </section>

        <section>
          <h2>Photos and services we use</h2>
          <p className="mt-2">
            Recipe and profile photos are stored with Cloudinary. Account and recipe data is stored in
            MongoDB. The site is hosted on Vercel. These providers process data only to run the site.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p className="mt-2">
            You can edit or delete your recipes at any time, and change your username, password and
            photo in <Link href="/profile">your account settings</Link>. To delete your account or ask
            about your data, contact the site owner.
            {/* TODO: add a contact email address here */}
          </p>
        </section>
      </div>
    </article>
  );
}
