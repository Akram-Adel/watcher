import fs from 'fs';

import { Configs } from '../../configs.d';

import { getInputWithFlag, resolveRootWithProject } from './utils';

const linkedCache: {[key: string]: string} = {};
export default function getLinkedRoot(linkedProject: string | undefined): string | never {
  if (!linkedProject) throw new Error('Internal script error');

  if (linkedCache[linkedProject]) return linkedCache[linkedProject];

  const input = getInputWithFlag('link');
  const { links } = require('../../configs.json') as Configs;

  if (!input) throw new Error('No link provided, did you forget to add a --link= flag?');
  if (!links || !links[input]) throw new Error('Provided link cannot be found, check your links configs');
  if (!links[input].root) throw new Error('Provided link does not have a root, check your links configs');

  const root = links[input].root as string;
  if (!fs.existsSync(root)) throw new Error('Link root does not exist, make sure that root path is valid');

  const value = resolveRootWithProject(root, linkedProject);
  linkedCache[linkedProject] = value;
  return value;
}
