# Trustpilot

A Trustpilot rating strip for a product page, with the Trustpilot logo and a live TrustBox widget.

| Trustpilot | |
| --- | --- |
| TrustBox template ID | Optional; defaults to Admiral's Micro Star template |
| Business unit ID | Optional; defaults to Admiral's business unit |
| Product SKU | Optional; defaults to `Home_` |

- The default model values are configured for Admiral. Override them only when the widget should display a different Trustpilot business unit, template or product reference.
- The SKU is passed to the TrustBox and is required by the configured Micro Star template to return product-rating data.
- The Trustpilot bootstrap script is loaded when the block decorates; the widget has a Trustpilot review link as fallback.

## Accessibility

The logo has the accessible name “Trustpilot”. Keep the widget's fallback link intact when customizing settings.

`trustpilot.js`, `trustpilot.css`, `_trustpilot.json`
