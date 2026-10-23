# Accordion

Accessible FAQ and disclosure rows, implemented with native `<details>` and `<summary>` elements.

| Accordion | |
| --- | --- |
| Question / title | Answer (rich text) |

- Add one **Accordion Item** for each question. Use its **Question / title** field for the summary and **Answer** for its rich-text panel.
- Items open and close using browser-native disclosure behavior; no JavaScript state or autoplay is used.
- Keyboard interaction and expanded state are provided by native HTML.

## Deviations from the live site

The live FAQ presentation is recreated with native disclosure elements instead of a custom scripted toggle.

`accordion.js`, `accordion.css`, `_accordion.json`
