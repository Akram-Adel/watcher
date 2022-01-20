import fs from 'fs';

import configs from '../../configs.json';
import { Configs } from '../../configs.d';

import errorHandler from '../errorHandler';
import { getInputWithFlag } from './utils';

export default function getProject(): string | never {
  const input = getInputWithFlag('project');
  const { aliase } = configs as Configs;

  if (!input) return errorHandler.throwCoded(1);
  if (aliase?.[input]) return resolveProject(aliase![input]);
  return resolveProject(input);
}

function resolveProject(input: string): string | never {
  if (!fs.existsSync(input)) return errorHandler.throwCoded(1);
  return input;
}
