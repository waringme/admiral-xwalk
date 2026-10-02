/**
 * testimonials — Admiral customer-quote carousel (replica of www.admiral.com's slick
 * slider). Reconstructive container (stardust/eds-schema: home testimonials).
 *
 * Model (xwalk container, _testimonials.json): one row per testimonial item, one cell —
 *   <p>quote</p> <h3>name</h3> <p>location</p>
 * Behaviour observed live (stardust/replica/motion/index.json): prev/next arrows move one
 * slide with a 0.5s transform transition; infinite loop; no autoplay. Loop clones (one
 * before, one per slide after — slick's own layout) are presentational: aria-hidden,
 * instrumentation stripped (EW4), so the authored content stays one node per testimonial.
 */
/** Universal Editor: move the row's instrumentation (data-aue-*, data-richtext-*) to the item
 * element that replaces it — same contract as scripts.js moveInstrumentation, inlined so the
 * block is self-contained. */
function moveInstrumentation(from, to) {
  [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
    .forEach((attr) => {
      to.setAttribute(attr, from.getAttribute(attr));
      from.removeAttribute(attr);
    });
}

function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index], [data-aue-resource], [data-aue-prop]').forEach((n) => {
    ['data-prose-index', 'data-image-index', 'data-aue-resource', 'data-aue-prop', 'data-aue-type', 'data-aue-label', 'data-aue-model', 'data-aue-filter']
      .forEach((a) => n.removeAttribute(a));
  });
  ['data-aue-resource', 'data-aue-type', 'data-aue-label', 'data-aue-model'].forEach((a) => el.removeAttribute(a));
  return el;
}

function arrow(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `slick-arrow ${className}`;
  button.setAttribute('aria-label', label);
  return button;
}

export default function decorate(block) {
  const track = wrap('slick-track');
  const slides = [...block.children].map((row) => {
    const cell = row.firstElementChild || row;
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    const nodes = [...cell.children];
    const headingAt = heading ? nodes.indexOf(heading) : nodes.length;
    const paras = nodes.filter((n) => n.tagName === 'P');
    const quote = paras.find((p) => nodes.indexOf(p) < headingAt);
    const rest = paras.filter((p) => p !== quote);
    const who = wrap('who', wrap('avatar'));
    if (heading) who.append(wrap('author', heading));
    rest.forEach((p) => who.append(wrap('location', p)));
    const testimonial = wrap('testimonial');
    if (quote) testimonial.append(wrap('callout', quote));
    testimonial.append(who);
    const slide = wrap('slick-slide', testimonial);
    moveInstrumentation(row, slide);
    return slide;
  });
  track.append(...slides);

  const clone = (s) => {
    const c = stripInstrumentation(s.cloneNode(true));
    c.classList.add('slick-cloned');
    c.setAttribute('aria-hidden', 'true');
    return c;
  };
  if (slides.length > 1) {
    track.prepend(clone(slides[slides.length - 1]));
    slides.forEach((s) => track.append(clone(s)));
  }

  const list = wrap('slick-list', track);
  const prev = arrow('slick-prev', 'Previous');
  const next = arrow('slick-next', 'Next');
  const slider = wrap('testimonials-slider', prev, list, next);
  block.replaceChildren(slider);

  if (slides.length < 2) {
    prev.hidden = true;
    next.hidden = true;
    return;
  }
  let index = 0;
  const place = (i, animate) => {
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateX(${-100 * (i + 1)}%)`;
  };
  const go = (i) => {
    place(i, true);
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-current', n === index));
    if (i !== index) track.addEventListener('transitionend', () => place(index, false), { once: true });
  };
  slides[0].classList.add('is-current');
  place(0, false);
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
}
