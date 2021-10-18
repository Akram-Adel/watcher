import errorHandler from '../errorHandler';

export type Configs = {
  aliase?: {[key: string]: string}
}

export function getInputWithFlag(flag: string): string | undefined | never {
  if (flag.includes(' ')) errorHandler.throwCoded(4);

  const fullFlag = `--${flag}=`;
  for (const input of process.argv) {
    if (input.includes(fullFlag)) return input.substr(fullFlag.length);
  }

  return undefined;
}
