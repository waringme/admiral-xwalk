/**
 * comparison-table — Admiral cover-levels table ("Choose from three levels of cover"): dark
 * heading row, navy row labels, white value cells (replica of www.admiral.com,
 * table.general.hybrid).
 *
 * Model (xwalk container, _comparison-table.json): one row per table-row item —
 *   cell 1   label   row heading; empty on the first row → that row is the column headings
 *   cell 2-4 value1-3  cell values; `x` / `✕` / `-` → "not included" cross. A "/" in a
 *                    heading breaks the line (live: "Admiral / Gold").
 * Columns that are empty in every row are dropped. The table scrolls sideways on small screens.
 * Authored rows → table rows; row instrumentation moves to the <tr> (EW1 moved, not rebuilt text).
 */
function moveInstrumentation(from, to) {
  [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'))
    .forEach((attr) => {
      to.setAttribute(attr, from.getAttribute(attr));
      from.removeAttribute(attr);
    });
}

const CROSS = /^(x|✕|×|-|–)$/i;

function fill(cell, source, heading) {
  const text = source.textContent.trim();
  if (CROSS.test(text)) {
    const cross = document.createElement('span');
    cross.className = 'cross';
    cross.setAttribute('aria-label', 'Not included');
    cell.append(cross);
    return;
  }
  if (heading && text.includes('/')) {
    text.split('/').map((s) => s.trim()).forEach((part, i) => {
      if (i) cell.append(document.createElement('br'));
      cell.append(part);
    });
    return;
  }
  cell.append(...(source.querySelector('p') ? source.querySelector('p').childNodes : source.childNodes));
}

export default function decorate(block) {
  const rows = [...block.children];
  const width = Math.max(...rows.map((r) => r.children.length));
  const used = [...Array(width).keys()].filter((i) => i === 0
    || rows.some((r) => r.children[i] && r.children[i].textContent.trim()));

  const table = document.createElement('table');
  const head = rows[0] && !rows[0].children[0]?.textContent.trim() ? rows[0] : null;
  if (head) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    moveInstrumentation(head, tr);
    used.forEach((i) => {
      const th = document.createElement('th');
      th.scope = 'col';
      if (head.children[i]) fill(th, head.children[i], true);
      tr.append(th);
    });
    thead.append(tr);
    table.append(thead);
  }
  const tbody = document.createElement('tbody');
  rows.filter((r) => r !== head).forEach((row) => {
    const tr = document.createElement('tr');
    moveInstrumentation(row, tr);
    used.forEach((i) => {
      const cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) cell.scope = 'row';
      if (row.children[i]) fill(cell, row.children[i], false);
      tr.append(cell);
    });
    tbody.append(tr);
  });
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'comparison-table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Cover levels');
  scroller.append(table);
  block.replaceChildren(scroller);
}
