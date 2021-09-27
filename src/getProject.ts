import fs from 'fs';

import errorHandler from './errorHandler';
import configs from '../configs.json';

const projectFlag = '--project=';
export default function getProject(): string {
  return (hasInputFlag(projectFlag))
    ? resolveProject()
    : resolveAbsolutePath();
}

function hasInputFlag(flag: string): boolean {
  for (const input of process.argv) {
    if (input.includes(flag)) return true;
  }
  return false;
}

function resolveProject(): string | never {
  if (!configs.project) errorHandler.throwCoded(2);
  let dir = configs.project;

  for (const input of process.argv) {
    if (input.includes(projectFlag)) dir += input.slice(projectFlag.length);
  }

  return (isValidDir(dir)) ? dir : errorHandler.throwCoded(1);
}

function resolveAbsolutePath(): string {
  const dir: string | undefined = process.argv[2];
  if (!isValidDir(dir)) errorHandler.throwCoded(1);
  return dir;
}

function isValidDir(dir: string | undefined): dir is string {
  return (!!dir && fs.existsSync(dir));
}
