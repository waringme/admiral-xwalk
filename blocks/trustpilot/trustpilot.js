/**
 * Trustpilot — review strip under the product hero (block from waringme/admiral; admiral.com
 * .trustpilot.long-banner): the Trustpilot logo beside a live TrustBox
 * widget ("Rated 4.7 out of 5 · N reviews").
 *
 * A block-based component (block/v1/block) with a single model:
 *   templateId      — TrustBox template (default Micro Star)
 *   businessUnitId  — Admiral's Trustpilot business unit
 *   sku             — product reference(s) the rating covers; the Micro Star
 *                     template returns no data without one ("SKU is required")
 * Rows are read in model order; empty values fall back to the admiral.com ids.
 * The Trustpilot bootstrap script is loaded once, when the block decorates.
 *
 * @param {Element} block
 */
import { loadScript } from '../../scripts/aem.js';

const DEFAULTS = {
  templateId: '54d39695764ea907c0f34825',
  businessUnitId: '4be0843700006400050788f5',
  sku: 'Home_',
};
const BOOTSTRAP = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

export default async function decorate(block) {
  const values = [...block.children].map((row) => row.textContent.trim());
  const templateId = values[0] || DEFAULTS.templateId;
  const businessUnitId = values[1] || DEFAULTS.businessUnitId;
  const sku = values[2] || DEFAULTS.sku;

  const logo = document.createElement('span');
  logo.className = 'trustpilot-logo';
  logo.setAttribute('role', 'img');
  logo.setAttribute('aria-label', 'Trustpilot');

  const widget = document.createElement('div');
  widget.className = 'trustpilot-widget';
  Object.entries({
    locale: 'en-US', // as admiral.com; the review count is locale-scoped
    'template-id': templateId,
    'businessunit-id': businessUnitId,
    sku,
    'style-height': '24px',
    'style-width': '100%',
    theme: 'light',
    'no-reviews': 'hide',
    'scroll-to-list': 'true',
    'style-alignment': 'center',
  }).forEach(([k, v]) => widget.setAttribute(`data-${k}`, v));
  const fallback = document.createElement('a');
  fallback.href = 'https://uk.trustpilot.com/review/www.admiral.com';
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'Trustpilot';
  widget.append(fallback);

  const wrap = document.createElement('div');
  wrap.className = 'trustpilot-widget-wrap';
  wrap.append(widget);

  block.textContent = '';
  block.append(logo, wrap);

  await loadScript(BOOTSTRAP, { async: '' });
  if (window.Trustpilot) window.Trustpilot.loadFromElement(widget, true);
}
