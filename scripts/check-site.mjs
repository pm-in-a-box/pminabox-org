import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const origin = "https://pm-in-a-box.org";
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === ".context" || entry.name === "node_modules") continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function fail(file, message) {
  failures.push((path.relative(root, file) || ".") + ": " + message);
}

function matches(source, pattern) {
  return [...source.matchAll(pattern)];
}

function pageUrl(file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (relative === "index.html") return origin + "/";
  return origin + "/" + relative.replace(/index\.html$/, "");
}

function attribute(tag, name) {
  const match = tag.match(new RegExp("\\b" + name + "=\"([^\"]*)\""));
  return match?.[1] ?? null;
}

async function assertLocalTarget(sourceFile, reference, htmlByFile) {
  if (
    !reference ||
    reference.startsWith("#") ||
    reference.startsWith("http://") ||
    reference.startsWith("https://") ||
    reference.startsWith("mailto:") ||
    reference.startsWith("tel:") ||
    reference.startsWith("data:")
  ) {
    if (reference?.startsWith("#")) {
      const id = reference.slice(1);
      if (id && !htmlByFile.get(sourceFile)?.includes("id=\"" + id + "\"")) {
        fail(sourceFile, "missing local anchor #" + id);
      }
    }
    return;
  }

  const parts = reference.split("#", 2);
  const withoutFragment = parts[0];
  const fragment = parts[1];
  const withoutQuery = withoutFragment.split("?", 1)[0];
  const resolved = withoutQuery.startsWith("/")
    ? path.join(root, withoutQuery.slice(1))
    : path.resolve(path.dirname(sourceFile), withoutQuery);
  let target = resolved;
  try {
    if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
  } catch {
    if (withoutQuery.endsWith("/")) target = path.join(target, "index.html");
  }

  try {
    const targetStat = await stat(target);
    if (!targetStat.isFile()) fail(sourceFile, "local target is not a file: " + reference);
  } catch {
    fail(sourceFile, "missing local target: " + reference);
    return;
  }

  if (fragment && target.endsWith(".html")) {
    const targetHtml = htmlByFile.get(target) ?? await readFile(target, "utf8");
    if (!targetHtml.includes("id=\"" + fragment + "\"")) {
      fail(sourceFile, "missing target anchor: " + reference);
    }
  }
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith(".html")).sort();
const htmlByFile = new Map(
  await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, "utf8")]))
);
const indexableUrls = new Set();
const indexedMetadata = [];

for (const file of htmlFiles) {
  const html = htmlByFile.get(file);
  const noindex = /<meta\s+name="robots"\s+content="[^"]*\bnoindex\b/i.test(html);

  if (!/^<!doctype html>/i.test(html)) fail(file, "missing HTML doctype");
  if (!/<html\s+lang="en-US">/i.test(html)) fail(file, "expected lang=\"en-US\"");
  if (html.includes("\u2014") || html.includes("&mdash;")) fail(file, "contains an em dash");
  if (/\bself-host(?:ed|ing)?\b|\bagentic harness\b|\bfully open source\b/i.test(html)) {
    fail(file, "contains retired product positioning");
  }

  const titles = matches(html, /<title>([^<]+)<\/title>/gi);
  const descriptions = matches(html, /<meta\s+name="description"\s+content="([^"]+)"\s*\/?>/gi);
  const canonicals = matches(html, /<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/gi);
  const headings = matches(html, /<h1(?:\s[^>]*)?>/gi);
  const robots = matches(html, /<meta\s+name="robots"\s+content="([^"]+)"\s*\/?>/gi);

  if (titles.length !== 1) fail(file, "expected one title, found " + titles.length);
  if (descriptions.length !== 1) fail(file, "expected one meta description, found " + descriptions.length);
  if (canonicals.length !== 1) fail(file, "expected one canonical, found " + canonicals.length);
  if (headings.length !== 1) fail(file, "expected one h1, found " + headings.length);
  if (robots.length !== 1) fail(file, "expected one robots meta tag, found " + robots.length);

  if (!noindex) {
    const expectedUrl = pageUrl(file);
    indexableUrls.add(expectedUrl);
    if (canonicals[0]?.[1] !== expectedUrl) fail(file, "canonical must be " + expectedUrl);
    const title = titles[0]?.[1] ?? "";
    const description = descriptions[0]?.[1] ?? "";
    indexedMetadata.push({ file, title, description });
    if (title.length < 25 || title.length > 65) fail(file, "title length is " + title.length + ", expected 25-65");
    if (description.length < 100 || description.length > 170) {
      fail(file, "description length is " + description.length + ", expected 100-170");
    }
    if (!html.includes("<meta property=\"og:url\" content=\"" + expectedUrl + "\"")) fail(file, "missing matching og:url");
    if (!/<meta\s+property="og:title"\s+content="[^"]+"/i.test(html)) fail(file, "missing og:title");
    if (!/<meta\s+property="og:description"\s+content="[^"]+"/i.test(html)) fail(file, "missing og:description");
    if (!/<meta\s+property="og:image"\s+content="https:\/\/pm-in-a-box\.org\/og-image\.png"/i.test(html)) {
      fail(file, "missing canonical og:image");
    }
    if (!/<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(html)) {
      fail(file, "missing large Twitter card");
    }
    if (!/<meta\s+name="twitter:image"\s+content="https:\/\/pm-in-a-box\.org\/og-image\.png"/i.test(html)) {
      fail(file, "missing canonical twitter:image");
    }
  }

  const jsonLdScripts = matches(html, /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (!noindex && jsonLdScripts.length === 0) fail(file, "missing JSON-LD");
  for (const script of jsonLdScripts) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      fail(file, "invalid JSON-LD: " + error.message);
    }
  }

  const ids = matches(html, /\sid="([^"]+)"/gi).map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) fail(file, "duplicate ids: " + duplicateIds.join(", "));

  for (const image of matches(html, /<img\b[^>]*>/gi)) {
    if (attribute(image[0], "alt") === null) fail(file, "image missing alt: " + image[0]);
  }

  const references = matches(html, /\b(?:href|src)="([^"]+)"/gi).map((match) => match[1]);
  for (const reference of references) await assertLocalTarget(file, reference, htmlByFile);
}

for (const field of ["title", "description"]) {
  const pagesByValue = new Map();
  for (const metadata of indexedMetadata) {
    const pages = pagesByValue.get(metadata[field]) ?? [];
    pages.push(metadata.file);
    pagesByValue.set(metadata[field], pages);
  }
  for (const pages of pagesByValue.values()) {
    if (pages.length < 2) continue;
    for (const file of pages) fail(file, "duplicate " + field + " across indexable pages");
  }
}

const homeFile = path.join(root, "index.html");
const homeHtml = htmlByFile.get(homeFile) ?? "";
for (const retiredClaim of ["Desktop and mobile", "Free during beta", "free during beta"]) {
  if (homeHtml.includes(retiredClaim)) fail(homeFile, "contains retired availability claim: " + retiredClaim);
}
for (const requiredClaim of ["Hosted beta by request", "Desktop app coming soon"]) {
  if (!homeHtml.includes(requiredClaim)) fail(homeFile, "missing availability disclosure: " + requiredClaim);
}
// License scope belongs in the agreement, not in marketing copy. Assert the
// home page does not restate it, so the two cannot drift apart again.
if (/noncommercial|non-commercial/i.test(homeHtml)) {
  fail(homeFile, "restates license scope; leave licensing to /eula/");
}

const termsFile = path.join(root, "eula", "index.html");
const termsHtml = htmlByFile.get(termsFile) ?? "";
const normalizedTermsHtml = termsHtml.replace(/\s+/g, " ");
for (const requiredTerm of [
  "Noncommercial product license",
  "Commercial use is prohibited without written permission",
  "We do not attest to any Marketplace Content",
  "License you grant for marketplace submissions",
  "desktop application is not publicly released",
  "enabled policy-change"
]) {
  if (!normalizedTermsHtml.includes(requiredTerm)) fail(termsFile, "missing required agreement term: " + requiredTerm);
}

const marketplaceFile = path.join(root, "marketplace", "index.html");
const marketplaceHtml = htmlByFile.get(marketplaceFile) ?? "";
if (!marketplaceHtml.includes("Marketplace placement is not an endorsement")) {
  fail(marketplaceFile, "missing marketplace non-endorsement disclosure");
}

const sitemapFile = path.join(root, "sitemap.xml");
const sitemap = await readFile(sitemapFile, "utf8");
const sitemapUrls = new Set(matches(sitemap, /<loc>([^<]+)<\/loc>/g).map((match) => match[1]));
for (const url of indexableUrls) {
  if (!sitemapUrls.has(url)) fail(sitemapFile, "missing indexable URL " + url);
}
for (const url of sitemapUrls) {
  if (!indexableUrls.has(url)) fail(sitemapFile, "contains non-indexable or unknown URL " + url);
}

const robotsFile = path.join(root, "robots.txt");
const robotsText = await readFile(robotsFile, "utf8");
if (!/^User-agent:\s*\*$/m.test(robotsText)) fail(robotsFile, "missing wildcard user agent");
if (!/^Allow:\s*\/$/m.test(robotsText)) fail(robotsFile, "missing root allow rule");
if (!/^Sitemap:\s*https:\/\/pm-in-a-box\.org\/sitemap\.xml$/m.test(robotsText)) {
  fail(robotsFile, "missing canonical sitemap directive");
}

for (const file of files.filter((candidate) => /\.(?:html|css|js|md|xml|txt|json|yml)$/i.test(candidate))) {
  const source = await readFile(file, "utf8");
  if (source.includes("\u2014") || source.includes("&mdash;")) fail(file, "contains an em dash");
}

if (failures.length) {
  console.error("Site checks failed (" + failures.length + "):");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("Site checks passed for " + htmlFiles.length + " HTML pages and " + indexableUrls.size + " sitemap URLs.");
