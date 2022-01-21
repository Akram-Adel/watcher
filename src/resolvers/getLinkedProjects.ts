import configs from '../../configs.json';
import { Configs } from '../../configs.d';

import { getInputWithFlag } from './utils';

export default function getLinkedProjects(): Array<string> | never {
  const input = getInputWithFlag('link');
  const { links } = configs as Configs;

  /* eslint-disable max-len */
  if (!input) throw new Error('No link provided, did you forget to add a --link= flag?');
  if (!links || !links[input]) throw new Error('Provided link cannot be found, check your links configs');
  if (!links[input].projects) throw new Error('Provided link does not have projects, check your links configs');
  /* eslint-enable max-len */

  return links[input].projects!;
}
