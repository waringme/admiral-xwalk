/**
 * callout — Admiral notification banner ("Good to know") and white quote box (replica of
 * www.admiral.com .notification-banners / .quote-box).
 *
 * Model (xwalk simple block, _callout.json): one richtext cell (heading 3 + paragraphs).
 * Colours: default yellow · `blue` (pale cyan) · `white` (expert quote box).
 * The authored cell is unwrapped in place (EW1).
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;
  block.replaceChildren(...cell.childNodes);
}
