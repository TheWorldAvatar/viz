import { dexieTaskRepo, TASK_SYNC_EVENT } from "@/utils/db/dexie-task-repository";
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncPlugin, NetworkFirst, NetworkOnly, Serwist } from "serwist";

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

const assetPrefix: string = process.env.ASSET_PREFIX || "";

const bgSyncPlugin: BackgroundSyncPlugin = new BackgroundSyncPlugin("form-submissions", {
  maxRetentionTime: 24 * 60, // Retry 24 hours
});


const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    ignoreURLParametersMatching: [/.*/],
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname === assetPrefix + "/api/status",
      handler: new NetworkOnly()
    },
    {
      matcher: ({ url }) => url.pathname === assetPrefix + "/api/registry/event",
      method: "PUT",
      handler: new NetworkOnly({
        plugins: [bgSyncPlugin],
      })
    },
    {
      matcher({ request, sameOrigin }) {
        return sameOrigin && (
          request.headers.get("RSC") === "1" ||
          request.headers.get("Next-Router-Prefetch") === "1"
        );
      },
      handler: new NetworkFirst({
        cacheName: "rsc-cache",
        matchOptions: {
          ignoreSearch: true,
        }
      }),
    },
    ...defaultCache,
  ], fallbacks: {
    entries: [
      {
        url: `${assetPrefix}/~offline`,
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === TASK_SYNC_EVENT) {
    const { entityType, sortParams, filterParams, } = event.data.payload || {};

    await dexieTaskRepo.sync(entityType, sortParams, filterParams, navigator.onLine);
  }
});