#!/usr/bin/env node
/**
 * Generates `ui/graphic/icon/icon-registry.generated.ts` from the icon names
 * used in deployment config under `public/`.
 *
 * Names are lucide's own kebab-case ids, as published at lucide.dev/icons.
 *
 * `public/` is bind-mounted per deployment and the Next.js build is deferred to
 * container launch (see check-build-start.sh), so this runs against the config
 * the deployment actually uses.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LUCIDE_ICONS = join(ROOT, "node_modules/lucide-react/dist/esm/icons");
const OUT = join(ROOT, "ui/graphic/icon/icon-registry.generated.ts");
const CONFIG_DIR = join(ROOT, "public");
const SOURCE_DIRS = ["ui", "app"];

const ICON_CONFIG_FILES = [
  join(CONFIG_DIR, "config/ui-settings.json"),
  join(CONFIG_DIR, "config/map-settings.json"),
];

const IMAGE = /\.(png|jpe?g|svg)$/i;

/**
 * Recursively collect files under `dir` whose name matches `test`.
 *
 * Uses dirents rather than statSync: `public/` is a bind mount, and statSync
 * follows symlinks, so a dangling one would throw ENOENT and abort the build.
 */
function walk(dir, test, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, test, found);
    else if (test.test(entry.name)) found.push(path);
  }
  return found;
}

/** A dangling symlink survives `walk` as a plain entry, so reads must not throw. */
function read(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

/** lucide publishes kebab-case ids; the React export is their PascalCase form. */
function toPascalCase(kebabCase) {
  return kebabCase
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

// `index.mjs` here is lucide's barrel, not an icon. Left in, "index" would pass
// validation and then fail the build on a non-existent `Index` export.
const available = new Set(
  readdirSync(LUCIDE_ICONS)
    .filter((f) => f.endsWith(".mjs") && f !== "index.mjs")
    .map((f) => f.slice(0, -".mjs".length))
);

/** Records `name` into `usage`, tracking every file it was seen in for error output. */
function record(name, file, usage) {
  const clean = name.trim().replace(/^(["'])(.*)\1$/, "$2");
  if (!clean || IMAGE.test(clean)) return;
  if (!usage.has(clean)) usage.set(clean, new Set());
  usage.get(clean).add(relative(ROOT, file));
}

/**
 * Collect string values held under an exact `icon` key, at any depth.
 *
 * Parsing rather than matching text keeps map-settings' `"icons"` URL map out of
 * the results by construction, and cannot mistake an `"icon":` sequence that
 * merely appears inside some other value.
 */
function recordIcons(node, file, usage) {
  if (Array.isArray(node)) {
    for (const item of node) recordIcons(item, file, usage);
    return;
  }
  if (node === null || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "icon" && typeof value === "string") record(value, file, usage);
    else recordIcons(value, file, usage);
  }
}

// Every icon name found, mapped to the files it appeared in.
const usage = new Map();

// A deployment that leaves out an optional config file is valid, so a missing or
// malformed file must not abort the build here; the app validates its own config.
for (const file of ICON_CONFIG_FILES) {
  const src = read(file);
  if (src === null) continue;
  try {
    recordIcons(JSON.parse(src), file, usage);
  } catch {
    console.warn(`Skipped unparseable config: ${relative(ROOT, file)}`);
  }
}

// Optional pages carry an icon name in their markdown frontmatter, reached via
// `page.thumbnail ?? "info"` in the nav menu.
for (const file of walk(CONFIG_DIR, /\.md$/)) {
  const src = read(file);
  if (src === null) continue;
  const m = src.match(/^thumbnail:\s*(\S+)\s*$/m);
  if (m) record(m[1], file, usage);
}

// Components resolving a name through IconComponent also supply hardcoded
// fallbacks (`icon={link?.icon ?? "map"}`), which must be in the registry too.
// Only string literals inside an `icon` prop count — a bare `?? "..."` elsewhere
// is far more likely to be a default placement or class name.
for (const dir of SOURCE_DIRS) {
  for (const file of walk(join(ROOT, dir), /\.tsx$/)) {
    const src = read(file);
    if (src === null) continue;
    // `icon="map"` and `icon={link?.icon ?? "map"}` reduce to the same rule:
    // record every string literal in whatever follows `icon=`.
    for (const m of src.matchAll(/\bicon\s*=\s*("[^"]*"|\{[^}]*\})/g)) {
      for (const lit of m[1].matchAll(/"([^"]+)"/g)) record(lit[1], file, usage);
    }
  }
}

const resolvedIconNames = [];
const errors = [];

for (const name of [...usage.keys()].sort()) {
  if (available.has(name)) {
    resolvedIconNames.push(name);
  } else {
    const where = [...usage.get(name)].sort().join(", ");
    errors.push(`❌ "${name}" is not a lucide icon - used in ${where}`);
  }
}

if (errors.length) {
  console.error(
    `\nUnresolved icon names:\n\n${errors.join("\n")}\n\n` +
    `Icon names are lucide ids in kebab-case — browse them at https://lucide.dev/icons\n`
  );
  process.exit(1);
}

// lucide has alias ids that share one export (`arrow-down-01` and `arrow-down-0-1`
// are both `ArrowDown01`), so the import list must be deduped or it emits a
// duplicate identifier.
const components = [...new Set(resolvedIconNames.map((name) => toPascalCase(name)))].sort();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  [
    "// AUTO-GENERATED by scripts/generate-icon-registry.mjs — do not edit.",
    `import { type LucideIcon, ${components.join(", ")} } from "lucide-react";`,
    "",
    "export const ICON_REGISTRY: Record<string, LucideIcon> = {",
    ...resolvedIconNames.map((name) => `  ${JSON.stringify(name)}: ${toPascalCase(name)},`),
    "};",
    "",
  ].join("\n")
);

console.info(`Generated ${resolvedIconNames.length} config icons → ${relative(ROOT, OUT)}`);
