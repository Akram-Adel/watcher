import fs from 'fs';

import configs from '../../configs.json';
import { Configs } from '../../configs.d';

import { getInputWithFlag } from './utils';

export default function getProject(): string | never {
  const input = getInputWithFlag('project');
  const { aliase } = configs as Configs;

  if (!input) throw new Error('No project provided, did you forget to add a --project= flag?');

  if (aliase?.[input]) return resolveProject(aliase![input]);
  return resolveProject(input);
}

function resolveProject(input: string): string | never {
  if (!fs.existsSync(input)) throw new Error('Project does not exist, make sure that provided path is valid');
  return input;
}
