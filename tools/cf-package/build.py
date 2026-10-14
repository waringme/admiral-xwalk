#!/usr/bin/env python3
"""Build an AEM content package with the travel landing-page Content Fragment models, their
fragments, the admiral-xwalk GraphQL endpoint and the persisted queries the content-fragment
block uses (scope: stardust/travel-landing-cf-scope.md; pattern: waringme/vhi-ie press-release).

  models:    /conf/admiral-xwalk/settings/dam/cfm/models/{feature,feature-list,cover-level,cover-levels,media-text}
  fragments: /content/dam/admiral-xwalk/fragments/travel/…   (data: tools/cf-package/fragments/**.json)
  graphql:   /content/cq:graphql/admiral-xwalk/endpoint
             /conf/admiral-xwalk/settings/graphql/persistentQueries/{feature-list-by-path,cover-levels-by-path,
                                                                     media-text-by-path}

Writes an installable FileVault package to tools/cf-package/dist/.

  python3 tools/cf-package/build.py [set]
    travel (default)  the travel models, fragments/travel, the endpoint and the travel queries
    pet               only fragments/pet (the pet insurance page reuses the travel and car models)
    car               only what the car insurance pages add: the Product Pod / Cover Comparison
                      models, fragments/car and fragments/shared (each folder with its own allowed
                      models) and their queries — installing it changes nothing already migrated
                      (it reuses the travel package's Feature, Feature List and Media Text models,
                      endpoint and queries: install that package first)
"""
import html
import json
import sys
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DIST = HERE / 'dist'
DATA = HERE / 'fragments'
GRAPHQL = HERE / 'graphql'

CONF = '/conf/admiral-xwalk'
MODELS = f'{CONF}/settings/dam/cfm/models'
DAM_ROOT = '/content/dam/admiral-xwalk'
FRAGMENTS = f'{DAM_ROOT}/fragments'
IMAGES_ROOT = f'{DAM_ROOT}/images'
SITE_ROOT = '/content/admiral-xwalk'
GRAPHQL_ENDPOINT = '/content/cq:graphql/admiral-xwalk'
PERSISTED_QUERIES = f'{CONF}/settings/graphql/persistentQueries'
BUILT = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
AUTHOR = 'admin'

NS = ('xmlns:sling="http://sling.apache.org/jcr/sling/1.0" '
      'xmlns:cq="http://www.day.com/jcr/cq/1.0" '
      'xmlns:jcr="http://www.jcp.org/jcr/1.0" '
      'xmlns:nt="http://www.jcp.org/jcr/nt/1.0" '
      'xmlns:dam="http://www.day.com/dam/1.0" '
      'xmlns:dc="http://purl.org/dc/elements/1.1/" '
      'xmlns:mix="http://www.jcp.org/jcr/mix/1.0" '
      'xmlns:granite="http://www.adobe.com/jcr/granite/1.0"')

# model node name -> (title (drives the GraphQL type: Feature → FeatureModel / featureByPath), description, fields)
# field: (name, label, metaType, required, description[, referenced model for fragment-reference])
MODEL_DEFS = {
    'feature': ('Feature', 'One benefit or cover feature: heading, copy, a badge icon and an illustration', [
        ('title', 'Title', 'text-single', True, 'Feature heading'),
        ('description', 'Description', 'text-multi', False, 'Short explanation'),
        ('icon', 'Icon', 'reference', False, 'Small badge icon (boxed list, colour pods)'),
        ('illustration', 'Illustration', 'reference', False, 'Large illustration (alternating layout)'),
        ('imageAlt', 'Image Alt Text', 'text-single', False, 'Leave empty when the image is decorative'),
    ]),
    'feature-list': ('Feature List', 'An ordered list of features with a heading, introduction and footnote', [
        ('title', 'Title', 'text-single', True, 'Section heading'),
        ('introduction', 'Introduction', 'text-multi', False, 'Text under the heading'),
        ('features', 'Features', 'fragment-reference', False, 'Features, in display order', 'feature'),
        ('footnote', 'Footnote', 'text-multi', False, 'Small print under the list'),
    ]),
    'cover-level': ('Cover Level', 'One row of the cover levels table: the benefit and its limit per tier', [
        ('benefit', 'Benefit', 'text-single', True, 'Row heading'),
        ('value1', 'Tier 1 value', 'text-single', False, 'e.g. £10M; x for not included'),
        ('value2', 'Tier 2 value', 'text-single', False, 'e.g. £15M; x for not included'),
        ('value3', 'Tier 3 value', 'text-single', False, 'e.g. £20M; x for not included'),
    ]),
    'cover-levels': ('Cover Levels', 'The tier comparison table with its heading and Good to know note', [
        ('title', 'Title', 'text-single', True, 'Section heading'),
        ('introduction', 'Introduction', 'text-multi', False, 'Text under the heading'),
        ('goodToKnow', 'Good to know', 'text-multi', False, 'The yellow note above the table'),
        ('column1', 'Tier 1 name', 'text-single', False, 'e.g. Admiral'),
        ('column2', 'Tier 2 name', 'text-single', False, 'e.g. Admiral Gold'),
        ('column3', 'Tier 3 name', 'text-single', False, 'e.g. Admiral Platinum'),
        ('levels', 'Rows', 'fragment-reference', False, 'Table rows, in display order', 'cover-level'),
    ]),
    'media-text': ('Media Text', 'A heading and copy beside an image (e.g. What\'s travel insurance? with Annie)', [
        ('title', 'Title', 'text-single', True, 'Panel heading'),
        ('text', 'Text', 'text-multi', False, 'Paragraphs and lists beside the image'),
        ('image', 'Image', 'reference', False, 'Character cut-out or illustration'),
        ('imageAlt', 'Image Alt Text', 'text-single', False, 'Leave empty when the image is decorative'),
    ]),
    'product-pod': ('Product Pod', 'A product card: illustration, name, one-line pitch and a link to the product page', [
        ('title', 'Title', 'text-single', True, 'Product name'),
        ('description', 'Description', 'text-multi', False, 'One or two lines about the product'),
        ('image', 'Image', 'reference', False, 'Product illustration'),
        ('imageAlt', 'Image Alt Text', 'text-single', False, 'Leave empty when the image is decorative'),
        ('link', 'Link', 'page', False, 'The product page'),
        ('linkText', 'Link text', 'text-single', False, 'e.g. MultiCar Insurance'),
    ]),
    'product-pod-list': ('Product Pod List', 'Product cards with a heading and introduction (e.g. Looking for something else?)', [
        ('title', 'Title', 'text-single', True, 'Section heading'),
        ('introduction', 'Introduction', 'text-multi', False, 'Text under the heading'),
        ('pods', 'Products', 'fragment-reference', False, 'Product pods, in display order', 'product-pod'),
    ]),
    'cover-tier': ('Cover Tier', 'A level of cover shown as a table column: its name and logo', [
        ('name', 'Name', 'text-single', True, 'e.g. Admiral Platinum'),
        ('logo', 'Logo', 'reference', False, 'Tier badge; the name shows when there is none'),
    ]),
    'cover-row': ('Cover Row', 'One benefit and its value per tier (yes = tick, x or empty = cross, or text)', [
        ('benefit', 'Benefit', 'text-single', True, 'Row heading, e.g. Courtesy car'),
        ('value1', 'Tier 1 value', 'text-single', False, 'yes, x, or text such as Up to £300 / Optional'),
        ('value2', 'Tier 2 value', 'text-single', False, 'yes, x, or text'),
        ('value3', 'Tier 3 value', 'text-single', False, 'yes, x, or text'),
        ('value4', 'Tier 4 value', 'text-single', False, 'yes, x, or text'),
    ]),
    'cover-table': ('Cover Table', 'One tab of the cover comparison: its tiers (columns) and rows', [
        ('title', 'Title', 'text-single', True, 'Tab label, e.g. Comprehensive cover'),
        ('tiers', 'Tiers', 'fragment-reference', False, 'Columns, left to right (up to 4)', 'cover-tier'),
        ('rows', 'Rows', 'fragment-reference', False, 'Benefits, in display order', 'cover-row'),
    ]),
    'cover-comparison': ('Cover Comparison', 'The tabbed cover comparison table with its heading and footnote', [
        ('title', 'Title', 'text-single', True, 'Section heading'),
        ('introduction', 'Introduction', 'text-multi', False, 'Text under the heading'),
        ('tables', 'Tabs', 'fragment-reference', False, 'One cover table per tab', 'cover-table'),
        ('footnote', 'Footnote', 'text-multi', False, 'Small print under the table'),
    ]),
}

SETS = {
    'travel': {
        'name': 'admiral-xwalk-travel-cf', 'version': '1.1.0', 'label': 'travel landing pages (SEO + PPC)',
        'models': ['feature', 'feature-list', 'cover-level', 'cover-levels', 'media-text'],
        'folders': ['travel'],
        'queries': ['feature-list-by-path', 'cover-levels-by-path', 'media-text-by-path'],
        'description': ('Travel landing pages: Feature, Feature List, Cover Level, Cover Levels and Media Text content '
                        'fragment models, {n} fragments (key benefits, cover features, cover levels, What\'s travel '
                        'insurance?), the admiral-xwalk GraphQL endpoint and the feature-list-by-path / '
                        'cover-levels-by-path / media-text-by-path persisted queries. Requires the admiral-xwalk images '
                        'package (icons and illustrations).'),
    },
    'car': {
        'name': 'admiral-xwalk-car-cf', 'version': '1.0.0', 'label': 'car insurance pages',
        'models': ['product-pod', 'product-pod-list', 'cover-tier', 'cover-row', 'cover-table', 'cover-comparison'],
        'folders': ['car', 'shared'],
        # the reused travel models are allowed in the new folders too
        'allowed': ['feature', 'feature-list', 'media-text'],
        'queries': ['product-pod-list-by-path', 'cover-comparison-by-path'],
        'description': ('Car insurance pages: Product Pod, Product Pod List, Cover Tier, Cover Row, Cover Table and '
                        'Cover Comparison models, {n} fragments under fragments/car and fragments/shared, and the '
                        'product-pod-list-by-path / cover-comparison-by-path persisted queries. Adds only new nodes: '
                        'models, fragments and queries already installed are not changed. Requires the travel content '
                        'fragment package (1.1.0: Feature, Feature List and Media Text models, endpoint) and the car '
                        'images package.'),
    },
    'pet': {
        'name': 'admiral-xwalk-pet-cf', 'version': '1.0.0', 'label': 'pet insurance pages',
        'models': [],  # only models already installed (travel + car packages)
        'folders': ['pet'],
        'allowed': ['feature', 'feature-list', 'media-text', 'product-pod', 'product-pod-list'],
        'queries': [],
        'description': ('Pet insurance pages: {n} fragments under fragments/pet (Feature List, Media Text and Product '
                        'Pod fragments: key benefits, cover types tabs, what is and is not covered, quote checklist, '
                        'claim steps, reasons, FAQs, cat and dog pods). Adds only the new folder: models, fragments and '
                        'queries already installed are not changed. Requires the travel (1.1.0) and car (1.0.0) content '
                        'fragment packages (models, endpoint, queries) and the pet images package.'),
    },
}
SET_NAME = sys.argv[1] if len(sys.argv) > 1 else 'travel'
SET = SETS[SET_NAME]
NAME, GROUP, VERSION = SET['name'], 'admiral-xwalk', SET['version']
QUERIES = SET['queries']


def attr(value):
    return html.escape(str(value), quote=True)


# ---------------------------------------------------------------- models
def field_xml(index, name, label, meta, required, description, ref=None):
    common = (f'jcr:primaryType="nt:unstructured" fieldLabel="{attr(label)}" fieldDescription="{attr(description)}" '
              f'listOrder="{index}" metaType="{"reference" if meta == "page" else meta}" name="{name}" '
              'renderReadOnly="false" showEmptyInReadOnly="true"')
    if required:
        common += ' required="on"'
    data = True
    if meta == 'text-single':
        specific = ('sling:resourceType="granite/ui/components/coral/foundation/form/textfield" '
                    'maxlength="255" translatable="true" valueType="string"')
    elif meta == 'text-multi':
        specific = (f'sling:resourceType="dam/cfm/admin/components/authoring/contenteditor/multieditor" '
                    f'cfm-element="{attr(label)}" checked="false" default-mime-type="text/html" '
                    f'translatable="true" valueType="string"')
        data = False
    elif meta == 'reference':
        specific = ('sling:resourceType="dam/cfm/models/editor/components/contentreference" '
                    f'filter="hierarchy" nameSuffix="contentReference" rootPath="{IMAGES_ROOT}" '
                    'showThumbnail="true" validation="cfm.validation.contenttype.image" valueType="string"')
    elif meta == 'page':  # content reference picking a site page (GraphQL PageRef)
        specific = ('sling:resourceType="dam/cfm/models/editor/components/contentreference" '
                    f'filter="hierarchy" nameSuffix="contentReference" rootPath="{SITE_ROOT}" '
                    'showThumbnail="false" valueType="string"')
    else:  # fragment-reference, multiple values: string/content-fragment[] makes GraphQL type it as the
        # referenced model ([FeatureModel]); plain string[] would make it a leaf [String]
        specific = ('sling:resourceType="dam/cfm/models/editor/components/fragmentreference" '
                    f'filter="hierarchy" fragmentmodelreference="[{MODELS}/{ref}]" nameSuffix="contentReference" '
                    f'rootPath="{FRAGMENTS}" valueType="string/content-fragment[]"')
    node = f'_x0031_7600000000{index:02d}'
    if data:
        return (f'                        <{node} {common} {specific}>\n'
                f'                            <granite:data jcr:primaryType="nt:unstructured"/>\n'
                f'                        </{node}>')
    return f'                        <{node} {common} {specific}/>'


def model_xml(name):
    title, description, fields = MODEL_DEFS[name]
    path = f'{MODELS}/{name}'
    items = '\n'.join(field_xml(i + 1, *f) for i, f in enumerate(fields))
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<jcr:root {NS}
    jcr:primaryType="cq:Template"
    allowedPaths="[/content/entities(/.*)?]"
    ranking="{{Long}}100">
    <jcr:content
        cq:lastModified="{{Date}}{BUILT}"
        cq:lastModifiedBy="{AUTHOR}"
        cq:scaffolding="{path}/jcr:content/model"
        cq:templateType="/libs/settings/dam/cfm/model-types/fragment"
        jcr:primaryType="cq:PageContent"
        jcr:title="{attr(title)}"
        jcr:description="{attr(description)}"
        sling:resourceSuperType="dam/cfm/models/console/components/data/entity"
        sling:resourceType="dam/cfm/models/console/components/data/entity/default"
        status="enabled">
        <model
            cq:targetPath="/content/entities"
            jcr:primaryType="cq:PageContent"
            sling:resourceType="wcm/scaffolding/components/scaffolding"
            dataTypesConfig="/mnt/overlay/settings/dam/cfm/models/formbuilderconfig/datatypes"
            maxGeneratedOrder="{len(fields)}">
            <cq:dialog
                jcr:primaryType="nt:unstructured"
                sling:resourceType="cq/gui/components/authoring/dialog">
                <content
                    jcr:primaryType="nt:unstructured"
                    sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns">
                    <items
                        jcr:primaryType="nt:unstructured"
                        maxGeneratedOrder="{len(fields)}">
{items}
                    </items>
                </content>
            </cq:dialog>
        </model>
    </jcr:content>
</jcr:root>
'''


# ---------------------------------------------------------------- fragments
def fragment_path(rel):
    return f'{FRAGMENTS}/{rel}'


def fragment_xml(rel, data):
    model = data['model']
    title, _desc, fields = MODEL_DEFS[model]
    path = fragment_path(rel)
    folder, name = path.rsplit('/', 1)
    modified = f'{{Date}}{BUILT}'
    props = ['jcr:mixinTypes="[cq:Taggable,dam:cfVariationNode]"']
    for fname, _label, meta, _req, _desc2, *ref in fields:
        value = data.get(fname)
        if meta in ('reference', 'page'):
            if not value:  # an empty string is not a valid reference
                continue
            if meta == 'page' and not value.startswith('/content/'):  # site path -> AEM page path
                value = SITE_ROOT + value
            props.append(f'{fname}="{attr(value)}"')
        elif meta == 'fragment-reference':
            refs = [fragment_path(v) for v in (value or [])]
            props.append(f'{fname}="[{",".join(attr(r) for r in refs)}]"')
        else:
            props.append(f'{fname}="{attr(value or "")}"')
            if meta == 'text-multi':
                props.append(f'{fname}_x0040_ContentType="text/html"')
        props.append(f'{fname}_x0040_LastModified="{modified}"')
    master = '\n                '.join(props)
    label = attr(data.get('title') or data.get('benefit') or data.get('name') or name)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<jcr:root {NS}
    jcr:primaryType="dam:Asset"
    jcr:mixinTypes="[mix:referenceable]"
    jcr:uuid="{uuid.uuid5(uuid.NAMESPACE_URL, f'aem:{path}')}">
    <jcr:content
        cq:name="{name}"
        cq:parentPath="{folder}"
        contentFragment="{{Boolean}}true"
        jcr:lastModified="{{Date}}{BUILT}"
        jcr:lastModifiedBy="{AUTHOR}"
        lastFragmentSave="{{Date}}{BUILT}"
        jcr:primaryType="dam:AssetContent"
        jcr:title="{label}"
        jcr:description="{attr(title)} — {SET["label"]}">
        <data
            cq:model="{MODELS}/{model}"
            jcr:primaryType="nt:unstructured">
            <master
                jcr:primaryType="nt:unstructured"
                {master}/>
        </data>
        <metadata
            jcr:mixinTypes="[cq:Taggable]"
            jcr:primaryType="nt:unstructured"
            dc:title="{label}"/>
        <related jcr:primaryType="nt:unstructured"/>
    </jcr:content>
</jcr:root>
'''


# ---------------------------------------------------------------- folders, endpoint, queries
def page_xml(title):
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="cq:Page">\n    <jcr:content\n        jcr:primaryType="cq:PageContent"\n        jcr:title="{attr(title)}"/>\n</jcr:root>\n'


def folder_xml(title, conf=None, allowed_models=()):
    """Assets folder; jcr:content carries the cloud configuration and the allowed models policy."""
    conf_attr = f'\n        cq:conf="{conf}"' if conf else ''
    models_attr = f'\n        cq:allowedTemplates="[{",".join(allowed_models)}]"' if allowed_models else ''
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="sling:Folder">\n'
            f'    <jcr:content\n        jcr:primaryType="nt:unstructured"\n        jcr:title="{attr(title)}"{conf_attr}{models_attr}/>\n</jcr:root>\n')


def plain_folder_xml():
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="sling:Folder"/>\n'


def endpoint_xml():
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="nt:unstructured"\n'
            '    jcr:title="admiral-xwalk Endpoint"\n    sling:resourceType="graphql/sites/components/endpoint"/>\n')


def persisted_query_xml():
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<jcr:root {NS}
    jcr:created="{{Date}}{BUILT}"
    jcr:primaryType="nt:unstructured"
    sling:resourceType="graphql/persistent/query">
    <jcr:content
        jcr:data="{{Binary}}"
        jcr:lastModified="{{Date}}{BUILT}"
        jcr:mimeType="text/html"
        jcr:primaryType="nt:unstructured"
        sling:resourceType="graphql/persistent/query/content"/>
</jcr:root>
'''


def page_with_content_xml():
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<jcr:root {NS}\n    jcr:primaryType="cq:Page">\n    <jcr:content jcr:primaryType="nt:unstructured"/>\n</jcr:root>\n'


def main():
    tops = SET['folders']
    fragments = {str(p.relative_to(DATA))[:-5]: json.loads(p.read_text(encoding='utf-8'))
                 for p in sorted(DATA.rglob('*.json')) if str(p.relative_to(DATA)).split('/')[0] in tops}
    # every referenced fragment must exist in the package
    for rel, data in fragments.items():
        for fname, *_rest in MODEL_DEFS[data['model']][2]:
            if isinstance(data.get(fname), list):
                missing = [r for r in data[fname] if r not in fragments]
                assert not missing, f'{rel}.{fname}: missing {missing}'

    model_paths = [f'{MODELS}/{m}' for m in SET['models']]
    allowed = model_paths + [f'{MODELS}/{m}' for m in SET.get('allowed', [])]
    folders = sorted({rel.rsplit('/', 1)[0] for rel in fragments if '/' in rel} | set(tops))
    if SET_NAME == 'travel':
        roots = [f'{FRAGMENTS}/jcr:content', f'{FRAGMENTS}/travel', GRAPHQL_ENDPOINT]
    else:  # new folders only: the fragments root, the endpoint and other folders are left alone
        roots = [f'{FRAGMENTS}/{t}' for t in tops]
    filter_roots = model_paths + roots + [f'{PERSISTED_QUERIES}/{q}' for q in QUERIES]
    filter_xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n'
                  + ''.join(f'    <filter root="{r}"/>\n' for r in filter_roots) + '</workspaceFilter>\n')
    properties_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
                      '<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n'
                      f'<entry key="name">{NAME}</entry>\n<entry key="group">{GROUP}</entry>\n<entry key="version">{VERSION}</entry>\n'
                      f'<entry key="description">{html.escape(SET["description"].format(n=len(fragments)), quote=False)}</entry>\n'
                      '<entry key="requiresRoot">false</entry>\n<entry key="packageType">content</entry>\n</properties>\n')
    files = {
        'META-INF/vault/filter.xml': filter_xml,
        'META-INF/vault/properties.xml': properties_xml,
        # ancestors: only created if missing (outside the filter roots, never overwritten)
        'jcr_root/conf/admiral-xwalk/.content.xml': plain_folder_xml(),
        'jcr_root/conf/admiral-xwalk/settings/.content.xml': plain_folder_xml(),
        'jcr_root/conf/admiral-xwalk/settings/dam/.content.xml': page_xml('DAM'),
        'jcr_root/conf/admiral-xwalk/settings/dam/cfm/.content.xml': page_xml('Content Fragments'),
        'jcr_root/conf/admiral-xwalk/settings/dam/cfm/models/.content.xml': page_xml('Content Fragment Models'),
        f'jcr_root{FRAGMENTS}/.content.xml': folder_xml('Fragments', CONF, allowed),
        'jcr_root/conf/admiral-xwalk/settings/graphql/.content.xml': page_with_content_xml(),
        'jcr_root/conf/admiral-xwalk/settings/graphql/persistentQueries/.content.xml': page_with_content_xml(),
    }
    if SET_NAME == 'travel':
        files['jcr_root/content/_cq_graphql/admiral-xwalk/.content.xml'] = plain_folder_xml()
        files['jcr_root/content/_cq_graphql/admiral-xwalk/endpoint/.content.xml'] = endpoint_xml()
    for m in SET['models']:
        files[f'jcr_root{MODELS}/{m}/.content.xml'] = model_xml(m)
    for f in folders:
        title = f.rsplit('/', 1)[-1].replace('-', ' ').title()
        # a new top folder carries its own configuration and allowed models
        own = SET_NAME != 'travel' and f in tops
        files[f'jcr_root{FRAGMENTS}/{f}/.content.xml'] = folder_xml(title, CONF, allowed) if own else folder_xml(title)
    for rel, data in fragments.items():
        files[f'jcr_root{fragment_path(rel)}/.content.xml'] = fragment_xml(rel, data)
    for q in QUERIES:
        files[f'jcr_root{PERSISTED_QUERIES}/{q}/.content.xml'] = persisted_query_xml()
        files[f'jcr_root{PERSISTED_QUERIES}/{q}/_jcr_content/_jcr_data.binary'] = (GRAPHQL / f'{q}.graphql').read_text(encoding='utf-8')
    DIST.mkdir(parents=True, exist_ok=True)
    out = DIST / f'{NAME}-{VERSION}.zip'
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
        for name, body in files.items():
            z.writestr(name, body)
    print(out.relative_to(ROOT), f'{len(SET["models"])} models, {len(fragments)} fragments, {len(QUERIES)} queries')


if __name__ == '__main__':
    main()
