import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope & typeof globalThis;

const assetPrefix: string = process.env.ASSET_PREFIX;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && (
          request.headers.get("RSC") === "1" ||
          request.headers.get("Next-Router-Prefetch") === "1"
        );
      },
      handler: new NetworkFirst({
        cacheName: "rsc-cache",
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              const url: URL = new URL(request.url);
              url.searchParams.delete("id");
              url.searchParams.delete("_rsc");
              return url.href;
            },
          },
        ],
      }),
    },
    ...defaultCache,
  ], fallbacks: {
    entries: [
      {
        url: `${assetPrefix || ""}/~offline`,
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();