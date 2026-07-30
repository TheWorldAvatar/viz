import { createSerwistRoute } from "@serwist/turbopack";

const assetPrefix: string = process.env.ASSET_PREFIX;
const buildRevision: string = process.env.NEXT_BUILD_ID || crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "app/sw.ts",
  // If set to `false`, Serwist will attempt to use `esbuild-wasm`.
  useNativeEsbuild: true,
  esbuildOptions: {
    define: {
      "process.env.ASSET_PREFIX": JSON.stringify(assetPrefix),
    },
  },
  // Rewrite public directory contents with assetPrefix BUT NOT for the internal `.next` directory
  modifyURLPrefix: {
    "public/": `${assetPrefix}/`,
  },
  additionalPrecacheEntries: [{ url: `${assetPrefix || ""}/~offline`, revision: buildRevision }],
  manifestTransforms: [
    async (manifestEntries) => {
      const filteredEntries = manifestEntries.filter((entry) => {
        return !entry.url.includes("/static/media/") && !entry.url.endsWith(".ttf");
      });
      return { manifest: filteredEntries, warnings: [] };
    },
  ],
});