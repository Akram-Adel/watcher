import fs from 'fs';

import errorHandler from './errorHandler';

export const projectsRoot = `${process.env.HOME}/Documents/REMOVED-ACTUAL-`;

export default function dirResolver(): string {
  return (hasInputFlag('--project='))
    ? resolveProject()
    : resolveAbsolutePath();
}

function resolveProject(): string | never {
  let dir: string | undefined;

  const flag = '--project=';
  for (let i = 0; i < process.argv.length; i += 1) {
    const input = process.argv[i];
    if (input.includes(flag)) dir = `${projectsRoot}${input.slice(flag.length)}`;
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
