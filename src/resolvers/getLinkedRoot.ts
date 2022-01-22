import fs from 'fs';

import { Cache, Configs } from '../../typings.d';

import { getInputWithFlag, resolveRootWithProject } from './utils';

const linkedCache: Cache = {};
export default function getLinkedRoot(linkedProject: string | undefined): string | never {
  if (!linkedProject) throw new Error('Internal script error, getLinkedRoot called without parameters');

  if (linkedCache[linkedProject]) return linkedCache[linkedProject];

  const input = getInputWithFlag('link');
  const { links } = require('../../configs.json') as Configs;

  /* eslint-disable max-len */
  if (!input) throw new Error('Internal script error. getLinkedProjects should not have been called when no --link flag provided');
  if (!links || !links[input]) throw new Error('Provided link cannot be found, did you run `npm run update` after adding links to your configs?');
  if (!links[input].root) throw new Error(`Provided link does not have a root, check your links.${input} configs`);
  /* eslint-enable max-len */

  const root = links[input].root as string;
  if (!fs.existsSync(root)) throw new Error('Link root does not exist, make sure that root path is valid');

  const value = resolveRootWithProject(root, linkedProject);
  linkedCache[linkedProject] = value;
  return value;
}
