/**
 * teaser — Admiral "sub-hero banner": image strip + copy panel (replica of www.admiral.com).
 * Template-slotted (stardust/eds-schema: home fake-email + app banners, ski finder banner).
 *
 * Model rows (xwalk simple block, _teaser.json):
 *   1. image        desktop image (<picture>)
 *   2. mobileImage  mobile image (<picture>, optional — falls back to the desktop image)
 *   3. text         <h3> + <p> + CTA (<strong><a> → a.button.primary) or, for the `app`
 *                   variant, one paragraph holding the App Store / Google Play links
 * Variants: `light` (pale-blue panel, navy ink), `image-after` (image below copy on mobile,
 * flush left on desktop), `app` (store links painted as the brand badges, label visually
 * hidden — inconsistency register R-05). Authored nodes are moved, never rebuilt (EW1).
 */

const STORES = [['apple', /apple\.com/], ['android', /play\.google\.com/]];

function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const pictures = [];
  let copyCell = null;
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const pic = cell.querySelector('picture') || cell.querySelector('img');
    const hasText = [...cell.querySelectorAll('h1, h2, h3, h4, p')]
      .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
    if (pic && !hasText) pictures.push(pic);
    else if (hasText) copyCell = cell;
  });

  const [desktop, mobile] = pictures;
  const image = wrap('image');
  if (desktop) image.append(wrap('image-desktop', desktop));
  if (mobile) image.append(wrap('image-mobile', mobile));
  else image.classList.add('image-single');

  const copy = wrap('copy');
  if (copyCell) copy.append(...copyCell.children);

  if (block.classList.contains('app')) {
    const storePara = [...copy.querySelectorAll('p')].find((p) => p.querySelectorAll('a').length > 1);
    if (storePara) {
      const icons = wrap('app-icons', storePara);
      storePara.querySelectorAll('a').forEach((a) => {
        const store = STORES.find(([, re]) => re.test(a.href));
        if (store) a.classList.add(store[0]);
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        label.append(...a.childNodes);
        a.append(label);
      });
      copy.append(icons);
    }
  }

  block.replaceChildren(wrap('sub-hero-banner', image, copy));
}
