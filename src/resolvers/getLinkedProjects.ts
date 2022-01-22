import { Configs } from '../../typings.d';

import { getInputWithFlag } from './utils';

export default function getLinkedProjects(): Array<string> | never {
  const input = getInputWithFlag('link');
  const { links } = require('../../configs.json') as Configs;

  /* eslint-disable max-len */
  if (!input) throw new Error('Internal script error. getLinkedProjects should not have been called when no --link flag provided');
  if (!links || !links[input]) throw new Error('Provided link cannot be found, did you run `npm run update` after adding links to your configs?');
  if (!links[input].projects) throw new Error(`Provided link does not have projects, check your links.${input} configs`);
  /* eslint-enable max-len */

  return links[input].projects!;
}
