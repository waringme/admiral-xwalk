/*
 * Admiral replica — shared behavior layer. Only behaviors observed on the live site:
 *  - mega-nav: click a parent item to open its dropdown (desktop adds the page blackout);
 *    click the mobile "Menu" toggle to open the menu panel (observed via click probes,
 *    stardust/.work/replica/lift/index/tree-menu-{1440,360}.json).
 *  - testimonials carousel: prev/next arrows move one slide (slick, infinite).
 */
(() => {
  const nav = document.querySelector('.mega-nav');
  const blackout = document.querySelector('.mega-nav-blackout');

  const closeAll = () => {
    document.querySelectorAll('.mega-nav__item--open').forEach((li) => {
      li.classList.remove('mega-nav__item--open');
      li.querySelector(':scope > a').setAttribute('aria-expanded', 'false');
    });
    if (blackout) blackout.classList.remove('open');
  };

  document.querySelectorAll('.mega-nav__main > .mega-nav__item--parent > a').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const li = a.parentElement;
      const wasOpen = li.classList.contains('mega-nav__item--open');
      closeAll();
      if (!wasOpen) {
        li.classList.add('mega-nav__item--open');
        a.setAttribute('aria-expanded', 'true');
        if (blackout && window.matchMedia('(min-width: 768px)').matches) blackout.classList.add('open');
      }
    });
  });

  if (blackout) blackout.addEventListener('click', closeAll);

  const toggle = document.querySelector('.mega-nav__toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', (ev) => {
      ev.preventDefault();
      const open = nav.classList.toggle('is-open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Same mechanism as the live slick instance (infinite, slidesToShow 1): runtime loop
  // clones — one clone of the last slide before the track, clones of every slide after
  // it — aria-hidden, so the authored content stays three slides.
  document.querySelectorAll('[data-carousel]').forEach((slider) => {
    const track = slider.querySelector('.slick-track');
    const slides = [...track.children];
    const clone = (s) => {
      const c = s.cloneNode(true);
      c.classList.add('slick-cloned');
      c.classList.remove('is-current');
      c.setAttribute('aria-hidden', 'true');
      return c;
    };
    track.prepend(clone(slides[slides.length - 1]));
    slides.forEach((s) => track.append(clone(s)));
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
    place(0, false);
    slider.querySelector('.slick-prev').addEventListener('click', () => go(index - 1));
    slider.querySelector('.slick-next').addEventListener('click', () => go(index + 1));
  });
})();
