/** @type {import('next').NextConfig} */
const nextConfig = {
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
