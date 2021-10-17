import fs from 'fs';

import configs from '../../configs.json';
import errorHandler from '../errorHandler';
import getProject from './getProject';

export default function getRoot(): string | never {
  if (!configs.root) errorHandler.throwCoded(2);

  const project = getProject();
  if (!project) errorHandler.throwCoded(0);

  if (!fs.existsSync(`${project}/package.json`)) errorHandler.throwCoded(3);

  // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
  const packageConfig = require(`${project}/package.json`);
  if (!packageConfig.name) errorHandler.throwCoded(3);

  return `${configs.root}/node_modules/${packageConfig.name}`;
}
