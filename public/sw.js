/* Recipe Card Vault: offline helper for the installed app.
 *
 * - Pages: always tries the network first; a saved copy is used only when there's no
 *   connection (or the connection is very slow and we already have a copy).
 * - Build files, fonts, icons: saved the first time they load (their names never change).
 * - Recipe photos from Cloudinary: saved the first time they load.
 * - Never saved: sign-in, forms that save/edit, API calls, ads and analytics.
 */
const VERSION = "v1";
const CORE = `rcv-core-${VERSION}`;
const PAGES = "rcv-pages";
const STATIC = "rcv-static";
const IMAGES = "rcv-images";
const META = "rcv-meta";
const OFFLINE_URL = "/offline";
const SLOW_NETWORK_MS = 5000;
const LIMITS = { [PAGES]: 400, [STATIC]: 600, [IMAGES]: 500 };

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE);
      const res = await fetch(OFFLINE_URL, { cache: "reload" });
      if (res.ok) {
        const html = await res.clone().text();
        await cache.put(OFFLINE_URL, res);
        await cacheAssets(html);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith("rcv-core-") && key !== CORE) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;
    if (/^\/(_next\/static|fonts|icons)\//.test(url.pathname)) {
      event.respondWith(cacheFirst(req, STATIC));
    } else if (req.mode === "navigate") {
      event.respondWith(page(event, url));
    }
    // Everything else (in-app navigation data, images via /_next/image, etc.) goes straight
    // to the network. If that fails offline, Next.js reloads the page, which lands above.
    return;
  }

  if (url.hostname === "res.cloudinary.com") event.respondWith(image(req));
});

/* ---------- pages ---------- */

const NEVER_SAVE = /^\/(signin|signup|profile|new-recipe|recipes\/(edit|download))(\/|$)/;

function isSavablePage(url) {
  if (NEVER_SAVE.test(url.pathname)) return false;
  return (
    url.pathname === "/" ||
    url.pathname === "/me" ||
    url.pathname === "/explore" ||
    /^\/recipes\/[a-f0-9]{24}$/i.test(url.pathname) ||
    /^\/users\/[a-f0-9]{24}(\/bookmarks)?$/i.test(url.pathname)
  );
}

async function savePage(url, res) {
  // Only /me is expected to redirect; anything else that redirects (e.g. signed out) isn't saved.
  if (!res.ok || res.type !== "basic") return;
  if (res.redirected && url.pathname !== "/me") return;
  if (!(res.headers.get("content-type") || "").includes("text/html")) return;
  // Safari refuses to show a saved redirect for a page load, so store a plain copy.
  const body = await res.blob();
  const headers = new Headers(res.headers);
  // The body is already decoded; these would describe the original transfer, not this copy.
  ["content-encoding", "content-length", "transfer-encoding"].forEach((h) => headers.delete(h));
  const copy = new Response(body, { status: 200, headers });
  const cache = await caches.open(PAGES);
  await cache.put(url.href, copy);
  await trim(PAGES);
  return body;
}

async function savedPage(url) {
  const cache = await caches.open(PAGES);
  return (
    (await cache.match(url.href)) ||
    (/^\/recipes\//.test(url.pathname) ? await cache.match(url.href, { ignoreSearch: true }) : undefined)
  );
}

async function offlineFallback() {
  return (
    (await caches.match(OFFLINE_URL)) ||
    new Response("You're offline.", { status: 503, headers: { "Content-Type": "text/plain" } })
  );
}

async function page(event, url) {
  const savable = isSavablePage(url);
  let saving;
  const network = fetch(event.request).then((res) => {
    // Copy the response before the browser starts reading it.
    if (savable) saving = savePage(url, res.clone()).catch(() => {});
    return res;
  });
  // Keep the worker alive until the copy is stored (registered before any await).
  event.waitUntil(network.then(() => saving).catch(() => {}));
  const saved = savable ? await savedPage(url) : undefined;

  if (!saved) {
    try {
      return await network;
    } catch {
      return offlineFallback();
    }
  }
  // We have a copy: use the network if it answers in time, otherwise the copy.
  return Promise.race([
    network.catch(() => saved),
    new Promise((resolve) => setTimeout(() => resolve(saved), SLOW_NETWORK_MS)),
  ]);
}

/* ---------- build files, fonts, icons ---------- */

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    trim(name);
  }
  return res;
}

/* ---------- recipe photos ---------- */

async function fetchImage(href) {
  try {
    // A CORS copy can be stored at its real size (opaque ones count as ~7 MB each in Chrome).
    return await fetch(href, { mode: "cors", credentials: "omit" });
  } catch {
    return fetch(href, { mode: "no-cors" });
  }
}

async function image(req) {
  const cache = await caches.open(IMAGES);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  try {
    const res = await fetchImage(req.url);
    if (res.ok || res.type === "opaque") {
      await cache.put(req.url, res.clone());
      trim(IMAGES);
    }
    return res;
  } catch {
    // Offline: the page may ask for a different size than the one we saved.
    return (await similarImage(cache, req.url)) || Response.error();
  }
}

/** Cloudinary URLs end in the photo's id; sizes and crops come before it. */
function photoId(href) {
  const path = new URL(href).pathname;
  const version = path.match(/\/v\d+\/(.+)$/);
  if (version) return version[1];
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}

async function similarImage(cache, href) {
  const id = photoId(href);
  for (const key of await cache.keys()) {
    if (photoId(key.url) === id) return cache.match(key);
  }
  return undefined;
}

/* ---------- downloading ahead of time ---------- */

async function cacheAssets(html) {
  const urls = new Set();
  for (const m of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) urls.add(m[1]);
  const cache = await caches.open(STATIC);
  await Promise.all(
    [...urls].map(async (u) => {
      if (await cache.match(u)) return;
      const res = await fetch(u).catch(() => null);
      if (res && res.ok) await cache.put(u, res);
    })
  );

  const images = new Set();
  for (const m of html.matchAll(/<img[^>]+?src="(https:\/\/res\.cloudinary\.com\/[^"]+)"/g)) {
    images.add(m[1].replace(/&amp;/g, "&"));
  }
  const imageCache = await caches.open(IMAGES);
  for (const href of images) {
    if (await imageCache.match(href)) continue;
    const res = await fetchImage(href).catch(() => null);
    if (res && (res.ok || res.type === "opaque")) await imageCache.put(href, res);
  }
}

async function downloadAhead(user, urls) {
  const previous = await caches
    .open(META)
    .then((meta) => meta.match("/user"))
    .then((r) => (r ? r.text() : null));
  // A different account on this phone: drop the last person's copies first.
  if (previous && previous !== user) await clearSaved();
  // Opened again here: a cache object from before the clear would be orphaned.
  await (await caches.open(META)).put("/user", new Response(user));

  let saved = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const path = queue.shift();
      const url = new URL(path, self.location.origin);
      try {
        const res = await fetch(url.href, { credentials: "same-origin" });
        const body = await savePage(url, res);
        if (body) {
          await cacheAssets(await body.text());
          saved++;
        }
      } catch {
        /* offline or failed: try again next time */
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return saved;
}

async function clearSaved() {
  await Promise.all([PAGES, IMAGES, META].map((name) => caches.delete(name)));
}

async function trim(name) {
  const limit = LIMITS[name];
  if (!limit) return;
  const cache = await caches.open(name);
  const keys = await cache.keys();
  // Oldest first: cache keys keep the order they were added in.
  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) await cache.delete(key);
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "download-ahead" && data.user && Array.isArray(data.urls)) {
    event.waitUntil(
      downloadAhead(String(data.user), data.urls.slice(0, 400)).then((count) =>
        event.source && event.source.postMessage({ type: "download-ahead-done", count })
      )
    );
  } else if (data.type === "clear") {
    event.waitUntil(clearSaved());
  }
});
