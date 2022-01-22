import fs from 'fs';

import { Configs } from '../../typings.d';

import getProject from './getProject';
import { getInputWithFlag, resolveRootWithProject } from './utils';

export default function getRoot(): string | never {
  const input = getInputWithFlag('root');
  const { aliase, defaultRoot } = require('../../configs.json') as Configs;

  if (!defaultRoot && !input) throw new Error('No root provided, did you forget to add a --root= flag?');

  if (!input) return resolveRoot(defaultRoot!);
  if (aliase?.[input]) return resolveRoot(aliase![input]);
  return resolveRoot(input);
}

function resolveRoot(root: string): string {
  if (!fs.existsSync(root)) throw new Error('Root does not exist, make sure that provided path is valid');

  const project = getProject();
  if (!project) throw new Error('Internal script error');

  return resolveRootWithProject(root, project);
}
