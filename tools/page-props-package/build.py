#!/usr/bin/env python3
"""Build an AEM content package that sets the custom page properties the content upload drops
(Template, Header variant, Navigation, Robots, card fields, Category, article author/dates) on
the site's pages, from each staged page's metadata (content/**/*.plain.html).

Every filter root is a page's jcr:content with mode="merge_properties": missing properties are
added, existing properties and all page content (components, children) are left untouched.

  pages: /content/admiral-xwalk/…   →   dist/admiral-xwalk-page-properties-<version>.zip
"""
import html
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / 'content'
DIST = Path(__file__).resolve().parent / 'dist'
SITE = '/content/admiral-xwalk'
NAME, GROUP, VERSION = 'admiral-xwalk-page-properties', 'admiral-xwalk', '1.0.1'

# metadata row label -> (page property, JCR type)
PROPS = {
    'Template': ('template', 'string'), 'Theme': ('theme', 'string'), 'Nav': ('nav', 'path'),
    'Robots': ('robots', 'string'), 'Image': ('image', 'string'), 'Card Title': ('card-title', 'string'),
    'Card Summary': ('card-summary', 'string'), 'Card Link Text': ('card-link-text', 'string'),
    'Card Order': ('card-order', 'long'), 'Category': ('category', 'string'), 'Author': ('author', 'string'),
    'Author Image': ('author-image', 'string'), 'Published': ('published', 'date'),
    'Updated': ('updated', 'date'), 'Read Time': ('read-time', 'long'),
}
LABEL = {field: label for label, (field, _kind) in PROPS.items()}
NS = ('xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" '
      'xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"')


def page_meta(text):
    m = re.search(r'<div class="metadata">(.*?)</div>\s*</div>\s*(?:</main>|$)', text, re.S)
    return dict(re.findall(r'<div><div>([^<]+)</div><div>(.*?)</div></div>', m.group(1) if m else ''))


def value(kind, raw):
    raw = html.unescape(raw).strip()
    if kind == 'long':
        return f'{{Long}}{int(raw)}' if raw.isdigit() else None
    if kind == 'date':
        return f'{{Date}}{raw}T00:00:00.000Z' if re.fullmatch(r'\d{4}-\d{2}-\d{2}', raw) else None
    if kind == 'path':  # site path -> the AEM page path the Navigation picker stores
        return f'{SITE}{raw}' if raw.startswith('/') and not raw.startswith('/content/') else raw
    return raw


def main():
    pages = {}
    for f in sorted(CONTENT.rglob('*.plain.html')):
        rel = '/' + str(f.relative_to(CONTENT))[:-len('.plain.html')]
        props = {}
        for label, raw in page_meta(f.read_text(encoding='utf-8')).items():
            label = LABEL.get(label, label)
            if label in PROPS:
                name, kind = PROPS[label]
                v = value(kind, raw)
                if v:
                    props[name] = v
        if props:
            pages[f'{SITE}{rel}'] = props
    filters = ''.join(f'    <filter root="{p}/jcr:content" mode="merge_properties"/>\n' for p in pages)
    files = {
        'META-INF/vault/filter.xml': f'<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n{filters}</workspaceFilter>\n',
        'META-INF/vault/properties.xml': (
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
            '<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n'
            f'<entry key="name">{NAME}</entry>\n<entry key="group">{GROUP}</entry>\n<entry key="version">{VERSION}</entry>\n'
            f'<entry key="description">Adds the custom page properties (template, header variant, navigation, robots, '
            f'card fields, category, article author and dates) to {len(pages)} admiral-xwalk pages. merge_properties: '
            'existing properties and page content are not changed.</entry>\n'
            '<entry key="requiresRoot">false</entry>\n<entry key="packageType">content</entry>\n</properties>\n'),
    }
    for path, props in pages.items():
        attrs = ''.join(f'\n        {k}="{html.escape(v, quote=True)}"' for k, v in props.items())
        files[f'jcr_root{path}/.content.xml'] = (
            f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="cq:Page">\n'
            f'    <jcr:content\n        jcr:primaryType="cq:PageContent"{attrs}/>\n</jcr:root>\n')
    DIST.mkdir(parents=True, exist_ok=True)
    out = DIST / f'{NAME}-{VERSION}.zip'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, body in files.items():
            z.writestr(name, body)
    print(out.relative_to(ROOT), f'{len(pages)} pages')
    for path, props in pages.items():
        print(f'  {path[len(SITE):] or "/"}: {", ".join(props)}')


if __name__ == '__main__':
    main()
