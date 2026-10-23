# Comparison Table

A responsive cover-levels table with a heading row, labelled feature rows and up to three value columns.

| Table Row | |
| --- | --- |
| Row label | Leave empty on the first row to make it the column-heading row |
| Column 1 | Value, `x` for not included |
| Column 2 | Value |
| Column 3 | Value |

- Add one **Table Row** per table row. Leave the first row's label empty to create column headings.
- Enter `x`, `✕`, `×`, `-` or `–` for “Not included”; `✓`, `✔` or `yes` for “Included”. Other text is displayed as entered.
- A slash in a column heading is rendered as a line break, allowing labels such as “Admiral / Gold”.
- Columns with no values in any row are omitted. The table can scroll horizontally on narrow screens.

## Accessibility

The block creates a semantic table with column and row header scopes. Its horizontal scroller is keyboard focusable and labelled “Cover levels”.

`comparison-table.js`, `comparison-table.css`, `_comparison-table.json`
