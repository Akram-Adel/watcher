import fs from 'fs';

import errorHandler from './errorHandler';
import configs from '../configs.json';

export default function getProject(): string {
  return (hasInputFlag('--project='))
    ? resolveProject()
    : resolveAbsolutePath();
}

function resolveProject(): string | never {
  if (!configs.project) errorHandler.throwCoded(2);
  let dir = configs.project;

  const flag = '--project=';
  for (let i = 0; i < process.argv.length; i += 1) {
    const input = process.argv[i];
    if (input.includes(flag)) dir += input.slice(flag.length);
  }

  return (isValidDir(dir)) ? dir : errorHandler.throwCoded(1);
}

function resolveAbsolutePath(): string {
  const dir: string | undefined = process.argv[2];
  if (!isValidDir(dir)) errorHandler.throwCoded(1);
  return dir;
}

function hasInputFlag(flag: string): boolean {
  // eslint-disable-next-line no-restricted-syntax
  for (const input of process.argv) {
    if (input.includes(flag)) return true;
  }
  return false;
}

function isValidDir(dir: string | undefined): dir is string {
  return (!!dir && fs.existsSync(dir));
}
