import errorHandler from '../errorHandler';

// eslint-disable-next-line import/prefer-default-export
export function getInputWithFlag(flag: string): string | undefined | never {
  if (flag.includes(' ')) errorHandler.throwCoded(4);

  const fullFlag = `--${flag}=`;
  for (const input of process.argv) {
    if (input.includes(fullFlag)) return input.substring(fullFlag.length);
  }

  return undefined;
}
