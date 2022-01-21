import fs from 'fs';

import configs from '../../configs.json';
import { Configs } from '../../configs.d';

import getProject from './getProject';
import { getInputWithFlag } from './utils';

export default function getRoot(): string | never {
  const input = getInputWithFlag('root');
  const { aliase, defaultRoot } = configs as Configs;

  if (!defaultRoot && !input) throw new Error('No root provided, did you forget to add a --root= flag?');

  if (!input) return resolveRootWithProject(defaultRoot!);
  if (aliase?.[input]) return resolveRootWithProject(aliase![input]);
  return resolveRootWithProject(input);
}

function resolveRootWithProject(root: string): string {
  if (!fs.existsSync(root)) throw new Error('Root does not exist, make sure that provided path is valid');

  const project = getProject();
  if (!project) throw new Error('Internal script error');

  if (!fs.existsSync(`${project}/package.json`)) throw new Error('Project does not have package.json file');

  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  const packageConfig = require(`${project}/package.json`);
  if (!packageConfig.name) throw new Error('Project package.json does not have name value');

  return `${root}/node_modules/${packageConfig.name}`;
}
