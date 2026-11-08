import { ACTION_DOCS } from './actions.docs';
import { CHART_DOCS } from './charts.docs';
import { DATA_DOCS } from './data.docs';
import { DIRECTIVE_DOCS, PIPE_DOCS } from './directives.docs';
import { ComponentDoc, DOC_GROUPS, DocGroup } from './doc.model';
import { FEEDBACK_DOCS } from './feedback.docs';
import { FORM_DOCS } from './forms.docs';
import { LAYOUT_DOCS } from './layout.docs';
import { LIST_DOCS } from './lists.docs';
import { MEDIA_DOCS } from './media.docs';
import { OVERLAY_DOCS } from './overlays.docs';
import { PEOPLE_DOCS } from './people.docs';

/** Every page, in the order of the menu: by group as DOC_GROUPS lists them, then by title. */
export const COMPONENT_DOCS: readonly ComponentDoc[] = [
  ...ACTION_DOCS,
  ...FORM_DOCS,
  ...DATA_DOCS,
  ...FEEDBACK_DOCS,
  ...LAYOUT_DOCS,
  ...LIST_DOCS,
  ...OVERLAY_DOCS,
  ...MEDIA_DOCS,
  ...CHART_DOCS,
  ...PEOPLE_DOCS,
  ...DIRECTIVE_DOCS,
  ...PIPE_DOCS,
].sort((a, b) => DOC_GROUPS.indexOf(a.group) - DOC_GROUPS.indexOf(b.group) || a.title.localeCompare(b.title, 'en'));

/** The groups that have pages, each with its pages in order. */
export const DOCS_BY_GROUP: readonly { group: DocGroup; docs: ComponentDoc[] }[] = DOC_GROUPS
  .map(group => ({ group, docs: COMPONENT_DOCS.filter(doc => doc.group === group) }))
  .filter(section => section.docs.length > 0);

export function findDoc(slug: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find(doc => doc.slug === slug);
}
