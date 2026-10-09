#!/usr/bin/env python3
"""Build an AEM content package with the travel landing-page Content Fragment models, their
fragments, the admiral-xwalk GraphQL endpoint and the persisted queries the content-fragment
block uses (scope: stardust/travel-landing-cf-scope.md; pattern: waringme/vhi-ie press-release).

  models:    /conf/admiral-xwalk/settings/dam/cfm/models/{feature,feature-list,cover-level,cover-levels}
  fragments: /content/dam/admiral-xwalk/fragments/travel/…   (data: tools/cf-package/fragments/**.json)
  graphql:   /content/cq:graphql/admiral-xwalk/endpoint
             /conf/admiral-xwalk/settings/graphql/persistentQueries/{feature-list-by-path,cover-levels-by-path}

Writes an installable FileVault package to tools/cf-package/dist/.
"""
import html
import json
import uuid
import zipfile
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DIST = HERE / 'dist'
DATA = HERE / 'fragments'
GRAPHQL = HERE / 'graphql'
NAME, GROUP, VERSION = 'admiral-xwalk-travel-cf', 'admiral-xwalk', '1.0.1'

CONF = '/conf/admiral-xwalk'
MODELS = f'{CONF}/settings/dam/cfm/models'
DAM_ROOT = '/content/dam/admiral-xwalk'
FRAGMENTS = f'{DAM_ROOT}/fragments'
IMAGES_ROOT = f'{DAM_ROOT}/images'
GRAPHQL_ENDPOINT = '/content/cq:graphql/admiral-xwalk'
PERSISTED_QUERIES = f'{CONF}/settings/graphql/persistentQueries'
QUERIES = ['feature-list-by-path', 'cover-levels-by-path']
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
}


def attr(value):
    return html.escape(str(value), quote=True)


# ---------------------------------------------------------------- models
def field_xml(index, name, label, meta, required, description, ref=None):
    common = (f'jcr:primaryType="nt:unstructured" fieldLabel="{attr(label)}" fieldDescription="{attr(description)}" '
              f'listOrder="{index}" metaType="{meta}" name="{name}" renderReadOnly="false" showEmptyInReadOnly="true"')
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
        if meta == 'reference':
            if not value:  # an empty string is not a valid reference
                continue
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
    label = attr(data.get('title') or data.get('benefit') or name)
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
        jcr:description="{attr(title)} — travel landing pages (SEO + PPC)">
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
    fragments = {str(p.relative_to(DATA))[:-5]: json.loads(p.read_text(encoding='utf-8'))
                 for p in sorted(DATA.rglob('*.json'))}
    # every referenced fragment must exist in the package
    for rel, data in fragments.items():
        for fname, *_rest in MODEL_DEFS[data['model']][2]:
            if isinstance(data.get(fname), list):
                missing = [r for r in data[fname] if r not in fragments]
                assert not missing, f'{rel}.{fname}: missing {missing}'

    model_paths = [f'{MODELS}/{m}' for m in MODEL_DEFS]
    folders = sorted({rel.rsplit('/', 1)[0] for rel in fragments if '/' in rel} | {'travel'})
    filter_roots = model_paths + [f'{FRAGMENTS}/jcr:content', f'{FRAGMENTS}/travel', GRAPHQL_ENDPOINT] + [
        f'{PERSISTED_QUERIES}/{q}' for q in QUERIES]
    filter_xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<workspaceFilter version="1.0">\n'
                  + ''.join(f'    <filter root="{r}"/>\n' for r in filter_roots) + '</workspaceFilter>\n')
    properties_xml = ('<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'
                      '<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">\n<properties>\n'
                      f'<entry key="name">{NAME}</entry>\n<entry key="group">{GROUP}</entry>\n<entry key="version">{VERSION}</entry>\n'
                      '<entry key="description">Travel landing pages: Feature, Feature List, Cover Level and Cover Levels '
                      f'content fragment models, {len(fragments)} fragments (key benefits, cover features, cover levels), '
                      'the admiral-xwalk GraphQL endpoint and the feature-list-by-path / cover-levels-by-path persisted '
                      'queries. Requires the admiral-xwalk images package (icons and illustrations).</entry>\n'
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
        f'jcr_root{FRAGMENTS}/.content.xml': folder_xml('Fragments', CONF, model_paths),
        'jcr_root/content/_cq_graphql/admiral-xwalk/.content.xml': plain_folder_xml(),
        'jcr_root/content/_cq_graphql/admiral-xwalk/endpoint/.content.xml': endpoint_xml(),
        'jcr_root/conf/admiral-xwalk/settings/graphql/.content.xml': page_with_content_xml(),
        'jcr_root/conf/admiral-xwalk/settings/graphql/persistentQueries/.content.xml': page_with_content_xml(),
    }
    for m in MODEL_DEFS:
        files[f'jcr_root{MODELS}/{m}/.content.xml'] = model_xml(m)
    for f in folders:
        files[f'jcr_root{FRAGMENTS}/{f}/.content.xml'] = folder_xml(f.rsplit('/', 1)[-1].replace('-', ' ').title())
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
    print(out.relative_to(ROOT), f'{len(MODEL_DEFS)} models, {len(fragments)} fragments, {len(QUERIES)} queries')


if __name__ == '__main__':
    main()
