import fs from 'fs';

export function resolveRootWithProject(root: string, project: string): string {
  if (!fs.existsSync(`${project}/package.json`)) throw new Error(`No package.json found in ${project}`);

  const packageConfig = require(`${project}/package.json`);
  if (!packageConfig.name) throw new Error(`Project package.json does not have name value, check ${project}`);

  return `${root}/node_modules/${packageConfig.name}`;
}

export function getInputWithFlag(flag: string): string | undefined | never {
  if (flag.includes(' ')) throw new Error(`Invalid request flag: ${flag}`);

  const fullFlag = `--${flag}=`;
  for (const input of process.argv) {
    if (input.includes(fullFlag)) return input.substring(fullFlag.length);
  }

  return undefined;
}
