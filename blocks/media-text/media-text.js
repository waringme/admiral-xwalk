/**
 * media-text — Admiral "side image" panel ("What's travel insurance?"): a character cut-out
 * beside the copy (replica of www.admiral.com/travel-insurance, .side-image--annie-arms-folded).
 *
 * Model rows (xwalk simple block, _media-text.json):
 *   1. image  <picture> from the DAM (shown under the copy on mobile, as on live)
 *   2. text   heading + paragraphs / list
 * Style `image-right` puts the image on the right on desktop.
 * Authored nodes are moved into slots, never rebuilt (EW1).
 */
function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const media = wrap('media-text-media');
  const copy = wrap('media-text-copy');
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture') || cell.querySelector('img');
      const hasText = [...cell.querySelectorAll('h1, h2, h3, h4, p, ul, ol')]
        .some((n) => !n.querySelector('picture, img') && n.textContent.trim());
      if (pic && !hasText) media.append(pic);
      else if (cell.childNodes.length) copy.append(...cell.childNodes);
    });
  });
  block.replaceChildren(copy, media);
  if (!media.children.length) media.remove();
}
