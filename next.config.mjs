/** @type {import('next').NextConfig} */
const nextConfig = {
  // /finanzas is private: never index it and never cache it in shared caches.
  async headers() {
    return [
      {
        source: "/finanzas/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/finanzas",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ]
  },

  // ---------------------------------------------------------------------------
  // COOP/COEP headers for the Ragebait WASM build — DISABLED ON PURPOSE.
  //
  // The current Emscripten build is single-threaded (no pthreads / no
  // SharedArrayBuffer), so it does NOT need cross-origin isolation. Enabling
  // these headers unnecessarily would break cross-origin images/fonts elsewhere.
  //
  // ONLY uncomment this if you rebuild Ragebait with pthreads (-pthread) and
  // the game errors with "SharedArrayBuffer is not defined". Keep it scoped to
  // /ragebait/ — do not broaden it to the whole site.
  // NOTE: headers() is already defined above for /finanzas — add this entry to
  // that array instead of defining headers() a second time.
  //
  // async headers() {
  //   return [
  //     {
  //       source: "/ragebait/:path*",
  //       headers: [
  //         { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  //         { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  //       ],
  //     },
  //   ]
  // },
}

export default nextConfig
