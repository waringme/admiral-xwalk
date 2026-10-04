/**
 * cards-folder — the Admiral pods built from a folder of pages (no hand-authored cards).
 * Renders with the cards block's design and listing (blocks/cards).
 *
 * Model (xwalk block, _cards-folder.json) — one single-cell row per field, in this order:
 *   folder  the folder to list (link or path; /content/<site> prefix and .html are dropped)
 *   count   how many cards (default 6)
 *   order   `latest` (most recently modified first, default) or `card-order` (page property)
 * Variants (classes): the cards variants — `mobile-image`, `two-up`, `lead-two`, `narrow`.
 * Each page becomes a card from its Card title / Card summary / Card link text / Image
 * properties, falling back to its title, description and first image; the current page is
 * left out. In the Universal Editor an unset folder shows a prompt so the block stays selectable.
 * @ew-exempt all — index-driven listing; the block's only authored content is its config (EW5 c)
 */
import { loadCSS } from '../../scripts/aem.js';
import {
  folderCards, folderOf, wrap, AUTHOR_ROOT,
} from '../cards/cards.js';

const ORDERS = ['latest', 'card-order'];

function readConfig(block) {
  const config = { folder: null, count: 6, order: 'latest' };
  [...block.children].forEach((row) => {
    const text = row.textContent.trim();
    const folder = folderOf(row);
    if (folder && !config.folder) config.folder = folder;
    else if (/^\d+$/.test(text)) config.count = Math.max(1, Number(text));
    else if (ORDERS.includes(text.toLowerCase())) config.order = text.toLowerCase();
  });
  return config;
}

export default async function decorate(block) {
  const config = readConfig(block);
  // the pods' look (grid, variants, section spacing) lives in the cards block's stylesheet
  block.classList.add('cards');
  block.parentElement?.classList.add('cards-wrapper');
  block.closest('.section')?.classList.add('cards-container');
  const css = loadCSS(`${window.hlx.codeBasePath}/blocks/cards/cards.css`);

  const grid = wrap('grid');
  block.replaceChildren(grid);
  if (!config.folder) {
    if (AUTHOR_ROOT) grid.append(wrap('placeholder', 'Pick a folder to show its pages as cards.'));
    await css;
    return;
  }

  block.dataset.folder = config.folder;
  try {
    const cells = await folderCards(config.folder, { limit: config.count, order: config.order });
    grid.append(...cells);
    if (!cells.length && AUTHOR_ROOT) grid.append(wrap('placeholder', `No pages found in ${config.folder}.`));
  } catch {
    // listing unavailable: nothing to show
  }
  await css;
}
