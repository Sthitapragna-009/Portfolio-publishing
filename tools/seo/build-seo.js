// SEO pass for the whole site. Run from anywhere:  node tools/seo/build-seo.js
//
// For every page it writes one marked block into <head> (canonical, robots,
// Open Graph, Twitter card, JSON-LD breadcrumbs), then regenerates sitemap.xml,
// robots.txt and the share images in assets/og/. It is safe to re-run: the
// block between "seo:start" and "seo:end" is replaced, never duplicated. Run it
// again after any case-study build script regenerates a page, and after adding
// a project.
//
// If the site moves to a custom domain, change BASE and re-run.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const BASE = "https://kspportfolio-one.vercel.app";
const ROOT = path.resolve(__dirname, "..", "..");
const NAME = "Sthitapragna Kollepara";
const SAME_AS = [
  "https://www.linkedin.com/in/sthitapragna-kollepara-136a031aa",
  "https://www.instagram.com/capture_master_ksp/",
];
const SKIP_DIRS = new Set([".git", ".claude", "node_modules", "tools"]);
// App shells and wrappers: reachable and followable, but not search results.
const NOINDEX = (p) => p.startsWith("prototypes/") || p === "projects/khatiq-prototype.html" || p.startsWith("assets/");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const esc = (s) => s.replace(/&(?!(?:[a-z]+|#\d+);)/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&middot;/g, "\u00B7")
    .replace(/&quot;/g, '"');

function pages(dir = "") {
  const out = [];
  for (const f of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(f.name)) continue;
    const rel = dir ? dir + "/" + f.name : f.name;
    if (f.isDirectory()) out.push(...pages(rel));
    else if (f.name.endsWith(".html")) out.push(rel);
  }
  return out;
}

const urlOf = (p) => BASE + "/" + (p === "index.html" ? "" : p.replace(/(^|\/)index\.html$/, "$1"));

// Share image for each project: the card image the home page already uses.
const home = read("index.html");
const cardImage = {};
for (const m of home.matchAll(/<a class="project[^>]*href="(projects\/[^"]+)"[\s\S]*?<img src="([^"]+)"/g)) {
  cardImage[m[1]] = m[2];
}

function shareImage(p, html) {
  let src = p === "index.html" || p === "resume.html" ? "assets/hero.jpg" : cardImage[p];
  if (!src) {
    const m = html.match(/<img[^>]*src="([^"]+\.(?:webp|jpe?g|png))"/);
    if (!m) return null;
    src = path.posix.normalize(path.posix.join(path.posix.dirname(p), m[1]));
  }
  if (!fs.existsSync(path.join(ROOT, src))) return null;
  // LinkedIn and WhatsApp are unreliable with WebP, so every share image is a
  // 1200px JPEG in assets/og/.
  const slug = p.replace(/\.html$/, "").replace(/\//g, "-");
  const out = "assets/og/" + slug + ".jpg";
  const outAbs = path.join(ROOT, out);
  const srcAbs = path.join(ROOT, src);
  if (!fs.existsSync(outAbs) || fs.statSync(outAbs).mtimeMs < fs.statSync(srcAbs).mtimeMs) {
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    try {
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", srcAbs, "-vf", "scale=1200:-2", "-frames:v", "1", "-q:v", "4", outAbs]);
    } catch (e) {
      console.warn("  ffmpeg missing or failed for " + src + ", using the source image");
      return src;
    }
  }
  return out;
}

function crumbs(p, title) {
  const trail = [["Home", BASE + "/"]];
  if (p.startsWith("projects/")) trail.push(["Design Projects", BASE + "/#work"]);
  if (p === "collection.html") trail.push(["Photography", BASE + "/photography.html"]);
  if (p !== "index.html") trail.push([title, urlOf(p)]);
  return trail;
}

function block(p, html) {
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [, ""])[1]).trim();
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [, ""])[1]).trim();
  const short = title.split(/ \| | \u2014 /)[0];
  const url = urlOf(p);
  const noindex = NOINDEX(p);
  const hasOwnRobots = /<meta name="robots"/.test(html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, ""));
  const lines = [`<link rel="canonical" href="${url}" />`];
  if (noindex && !hasOwnRobots) lines.push(`<meta name="robots" content="noindex, follow" />`);
  if (!noindex) {
    const img = shareImage(p, html);
    const isProject = p.startsWith("projects/");
    lines.push(
      `<meta property="og:type" content="${isProject ? "article" : "website"}" />`,
      `<meta property="og:site_name" content="${NAME} \u2014 Portfolio" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      desc && `<meta property="og:description" content="${esc(desc)}" />`,
      `<meta property="og:url" content="${url}" />`,
      img && `<meta property="og:image" content="${BASE}/${img}" />`,
      `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}" />`
    );
    const person = { "@type": "Person", "@id": BASE + "/#person", name: NAME, url: BASE + "/" };
    const graph = [];
    if (p === "index.html") {
      graph.push(
        {
          ...person,
          alternateName: "KSP",
          jobTitle: "Designer",
          description: desc,
          image: BASE + "/assets/hero.jpg",
          alumniOf: { "@type": "CollegeOrUniversity", name: "Indian Institute of Technology Roorkee" },
          sameAs: SAME_AS,
        },
        { "@type": "WebSite", "@id": BASE + "/#website", url: BASE + "/", name: NAME + " \u2014 Portfolio", author: { "@id": BASE + "/#person" } }
      );
    } else {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: crumbs(p, short).map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
      });
      if (isProject) {
        graph.push({
          "@type": "CreativeWork",
          name: short,
          headline: title,
          description: desc,
          url,
          ...(img ? { image: BASE + "/" + img } : {}),
          author: person,
        });
      }
    }
    lines.push(`<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`);
  }
  return "<!-- seo:start -->\n  " + lines.filter(Boolean).join("\n  ") + "\n  <!-- seo:end -->";
}

const all = pages();
const indexable = [];
for (const p of all) {
  let html = read(p);
  const b = block(p, html);
  if (/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/.test(html)) {
    html = html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, () => b);
  } else {
    // After the description if there is one, otherwise after the title.
    const anchor = html.match(/<meta name="description"[^>]*>/) || html.match(/<title>[^<]*<\/title>/);
    if (!anchor) {
      console.warn("skipped (no <title>): " + p);
      continue;
    }
    html = html.replace(anchor[0], () => anchor[0] + "\n  " + b);
  }
  fs.writeFileSync(path.join(ROOT, p), html);
  if (!NOINDEX(p) && !/<meta name="robots" content="[^"]*noindex/.test(html)) indexable.push(p);
}

const lastmod = (p) => {
  try {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", p], { cwd: ROOT }).toString().trim();
    if (d) return d;
  } catch (e) {}
  return fs.statSync(path.join(ROOT, p)).mtime.toISOString().slice(0, 10);
};
const order = (p) => (p === "index.html" ? 0 : p.startsWith("projects/") ? 1 : 2);
indexable.sort((a, b) => order(a) - order(b) || a.localeCompare(b));
fs.writeFileSync(
  path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    indexable.map((p) => `  <url><loc>${urlOf(p)}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`seo: ${all.length} pages tagged, ${indexable.length} in sitemap.xml`);
