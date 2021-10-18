import fs from 'fs';

import configs from '../../configs.json';
import errorHandler from '../errorHandler';
import getProject from './getProject';
import { Configs, getInputWithFlag } from './utils';

export default function getRoot(): string | never {
  const input = getInputWithFlag('root');
  const { aliase } = configs as Configs;

  if (!configs.defaultRoot && !input) return errorHandler.throwCoded(2);
  if (!input) return resolveRootWithProject(configs.defaultRoot);
  if (aliase?.[input]) return resolveRootWithProject(aliase![input]);
  return resolveRootWithProject(input);
}

function resolveRootWithProject(input: string): string {
  if (!fs.existsSync(input)) return errorHandler.throwCoded(1);

  const project = getProject();
  if (!project) errorHandler.throwCoded(0);

  if (!fs.existsSync(`${project}/package.json`)) errorHandler.throwCoded(3);

  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  const packageConfig = require(`${project}/package.json`);
  if (!packageConfig.name) errorHandler.throwCoded(3);

  return `${input}/node_modules/${packageConfig.name}`;
}
