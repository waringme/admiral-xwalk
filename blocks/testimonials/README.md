# Testimonials

A customer-quote carousel with previous and next controls. Slides do not autoplay.

| Testimonial | |
| --- | --- |
| Quote, name (heading) and location | Rich text |

- Add one **Testimonial** item per customer quote. In the default style, place the quote paragraph before the name heading; following paragraph(s) are used for location details.
- Select **Expert quote** for the white quote-card layout. In that style author the name and role as a heading followed by the quote paragraph.
- With one slide, carousel controls are hidden. With multiple slides, the previous/next buttons move one slide, wrap at either end and animate the transition.
- The carousel clones slides for the visual loop; clones are hidden from assistive technology and are not separate authored items.

## Accessibility

Controls are buttons labelled “Previous” and “Next”. Include a clear name in each heading and do not put essential quote text in images.

`testimonials.js`, `testimonials.css`, `_testimonials.json`
