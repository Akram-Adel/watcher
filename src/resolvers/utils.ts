import fs from 'fs';

import { Cache } from '../../typings.d';

const projectCache: Cache = {};
export function resolveRootWithProject(root: string, project: string): string {
  if (projectCache[project]) return resolve(root, projectCache[project]);

  if (!fs.existsSync(`${project}/package.json`)) throw new Error(`No package.json found in ${project}`);

  const packageConfig = require(`${project}/package.json`);
  if (!packageConfig.name) throw new Error(`Project package.json does not have name value, check ${project}`);

  projectCache[project] = packageConfig.name;
  return resolve(root, packageConfig.name);
}

function resolve(root: string, project: string): string {
  return `${root}/node_modules/${project}`;
}

const flagCache: Cache = {};
export function getInputWithFlag(flag: string): string | undefined | never {
  if (flagCache[flag]) return flagCache[flag];

  if (flag.includes(' ')) throw new Error(`Internal script error, requested a flag with invalid format: ${flag}`); /* eslint-disable-line max-len */

  const fullFlag = `--${flag}=`;
  for (const input of process.argv) {
    if (input.includes(fullFlag)) {
      const value = input.substring(fullFlag.length);
      flagCache[flag] = value;
      return value;
    }
  }

  return undefined;
}
