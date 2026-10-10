#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Build an AEM content package with the travel demo pages as Universal Editor (xwalk) pages,
 * for when the platform's content Sync does not offer them.
 *
 * Each staged page (content/<path>.plain.html: Edge Delivery markup with field hints) goes
 * through the same converters the platform uses — div blocks → importer tables → markdown
 * (helix-importer html2md) → JCR (helix-md2jcr with this project's component models,
 * definitions and filters). Section breaks are added in the importer's transformDOM (its
 * pre-processing strips <hr>); section-metadata images become paths (reference fields). Then:
 *   - preview-site absolute URLs become site paths again (images /content/dam/…, links /…)
 *   - md2jcr's <p><h3>…</h3></p> rich text is unwrapped to <h3>…</h3>
 *   - folder / fragment-reference / navigation values become AEM page paths
 *     (/content/admiral-xwalk/…)
 * Filter roots are each page's jcr:content (mode replace): page content is replaced, child pages
 * and every other page are untouched; missing pages are created.
 *
 * Usage: node tools/page-content-package/build.mjs   →   tools/page-content-package/dist/*.zip
 */
import {
  existsSync, mkdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const SCRIPTS = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
const req = createRequire(`${SCRIPTS}/package.json`);
const { JSDOM } = req('jsdom');
const { html2md } = await import(req.resolve('@adobe/helix-importer'));
const { md2jcr } = await import(req.resolve('@adobe/helix-md2jcr'));

const SITE = '/content/admiral-xwalk';
const HOST = 'https://main--admiral-xwalk--waringme.aem.page';
const NAME = 'admiral-xwalk-travel-pages';
const VERSION = '1.0.2';
const HUB = '/resources/travel-hub/travel-planning';
const PAGES = [
  '/index', '/resources', '/resources/travel-hub', HUB,
  ...execFileSync('find', ['-L', `content${HUB}`, '-mindepth', '1', '-name', '*.plain.html'], {
    cwd: ROOT, encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .map((f) => f.slice('content'.length, -'.plain.html'.length))
    .sort(),
  '/travel-insurance', '/travel-insurance/generic', '/fragments/travel/whats-travel-insurance',
];
const REFERENCE_FIELDS = ['folder', 'reference', 'nav'];

const models = JSON.parse(readFileSync(join(ROOT, 'component-models.json'), 'utf8'));
const definition = JSON.parse(readFileSync(join(ROOT, 'component-definition.json'), 'utf8'));
const filters = JSON.parse(readFileSync(join(ROOT, 'component-filters.json'), 'utf8'));
const title = (cls) => cls.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

function sectionsToTables(document) {
  const main = document.querySelector('main');
  const body = document.createElement('div');
  // section metadata images (image-left / image-right) are reference fields: md2jcr takes a path
  main.querySelectorAll('.section-metadata img').forEach((img) => {
    (img.closest('picture') || img).replaceWith(img.getAttribute('src'));
  });
  [...main.children].filter((s) => s.tagName === 'DIV').forEach((section, i) => {
    if (i) body.append(document.createElement('hr'));
    [...section.childNodes].forEach((n) => {
      if (n.nodeType !== 1 || n.tagName !== 'DIV' || !n.className) {
        body.append(n);
        return;
      }
      // an EDS block div → importer block table (header row "Name (variants)")
      const [name, ...variants] = n.className.split(/\s+/).filter(Boolean);
      const rows = [...n.children];
      const table = document.createElement('table');
      const th = document.createElement('th');
      th.colSpan = Math.max(1, ...rows.map((r) => r.children.length));
      th.textContent = title(name) + (variants.length ? ` (${variants.join(', ')})` : '');
      const head = document.createElement('tr');
      head.append(th);
      table.append(head);
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        [...row.children].forEach((cell) => {
          const td = document.createElement('td');
          td.append(...cell.childNodes);
          tr.append(td);
        });
        table.append(tr);
      });
      body.append(table);
    });
  });
  main.replaceChildren(...body.childNodes);
  return main;
}

async function toMarkdown(path) {
  const html = readFileSync(join(ROOT, `content${path}.plain.html`), 'utf8');
  const { document } = new JSDOM(`<!DOCTYPE html><html><head></head><body><main>${html}</main></body></html>`).window;
  // the importer strips <hr> while pre-processing: section breaks are added in transformDOM
  const transformDOM = () => sectionsToTables(document);
  const { md } = await html2md(`${HOST}${path}`, document, { transformDOM }, { toDocx: false, toMd: true });
  return md;
}

function clean(xml) {
  let out = xml
    // md2jcr leaves a bare & of a link query string unescaped in its attribute
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;')
    .split(`${HOST}/`).join('/')
    .replace(/&lt;p&gt;(&lt;(h[1-6])&gt;.*?&lt;\/\2&gt;)&lt;\/p&gt;/g, '$1');
  // html2md turns some SVG images into icon shortcodes (:badge-pound:): back to their DAM asset
  out = out.replace(/ (image|mobileImage|fileReference)=":([a-z0-9-]+):"/g, (m, f, name) => {
    const rel = `travel/${name}.svg`;
    return existsSync(join(ROOT, 'stardust/prototypes/assets/img', rel)) ? ` ${f}="/content/dam/admiral-xwalk/images/${rel}"` : m;
  });
  REFERENCE_FIELDS.forEach((f) => {
    out = out.replace(new RegExp(` ${f}="(/(?!content/)[^"]*)"`, 'g'), (m, p) => ` ${f}="${SITE}${p === '/' ? '' : p}"`);
  });
  return out;
}

const files = {};
const filter = [];
// one page at a time (the converters share module state)
await PAGES.reduce(async (prev, path) => {
  await prev;
  const xml = clean(await md2jcr(await toMarkdown(path), { models, definition, filters }));
  files[`jcr_root${SITE}${path}/.content.xml`] = xml;
  filter.push(`    <filter root="${SITE}${path}/jcr:content"/>`);
  console.log('converted', path);
}, Promise.resolve());
files['META-INF/vault/filter.xml'] = `<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n${filter.join('\n')}\n</workspaceFilter>\n`;
files['META-INF/vault/properties.xml'] = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
<entry key="name">${NAME}</entry>
<entry key="group">admiral-xwalk</entry>
<entry key="version">${VERSION}</entry>
<entry key="description">Travel demo pages as Universal Editor pages (${PAGES.length}): homepage, /resources, the travel resource hub, the travel-planning hub with its 4 category pages and 19 pages, /travel-insurance, /travel-insurance/generic and the What's travel insurance fragment. Replaces each page's content (jcr:content); child pages are untouched; missing pages are created.</entry>
<entry key="requiresRoot">false</entry>
<entry key="packageType">content</entry>
</properties>
`;
const dist = join(HERE, 'dist');
mkdirSync(dist, { recursive: true });
const staging = join('/tmp', `${NAME}-${Date.now()}`);
Object.entries(files).forEach(([name, body]) => {
  mkdirSync(dirname(join(staging, name)), { recursive: true });
  writeFileSync(join(staging, name), body);
});
const zip = join(dist, `${NAME}-${VERSION}.zip`);
execFileSync('python3', ['-c', `import os,zipfile
z=zipfile.ZipFile(${JSON.stringify(zip)},'w',zipfile.ZIP_DEFLATED)
for d,_,fs in os.walk('.'):
    for f in fs: z.write(os.path.join(d,f), os.path.relpath(os.path.join(d,f),'.'))
z.close()`], { cwd: staging });
console.log(`${zip.slice(ROOT.length + 1)}: ${PAGES.length} pages`);
