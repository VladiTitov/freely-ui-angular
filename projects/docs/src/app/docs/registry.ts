import { ACTION_DOCS } from './actions.docs';
import { CHART_DOCS } from './charts.docs';
import { ComponentDoc, DOC_GROUPS, DocGroup } from './doc.model';
import { FEEDBACK_DOCS } from './feedback.docs';
import { FORM_DOCS } from './forms.docs';
import { LAYOUT_DOCS } from './layout.docs';
import { LIST_DOCS } from './lists.docs';
import { PEOPLE_DOCS } from './people.docs';

/** Every component page, in the order of the menu. */
export const COMPONENT_DOCS: readonly ComponentDoc[] = [
  ...ACTION_DOCS,
  ...FORM_DOCS,
  ...FEEDBACK_DOCS,
  ...LAYOUT_DOCS,
  ...LIST_DOCS,
  ...CHART_DOCS,
  ...PEOPLE_DOCS,
];

export const DOCS_BY_GROUP: readonly { group: DocGroup; docs: ComponentDoc[] }[] = DOC_GROUPS.map(group => ({
  group,
  docs: COMPONENT_DOCS.filter(doc => doc.group === group),
}));

export function findDoc(slug: string): ComponentDoc | undefined {
  return COMPONENT_DOCS.find(doc => doc.slug === slug);
}
