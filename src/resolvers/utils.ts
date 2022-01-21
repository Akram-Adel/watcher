// eslint-disable-next-line import/prefer-default-export
export function getInputWithFlag(flag: string): string | undefined | never {
  if (flag.includes(' ')) throw new Error(`Invalid request flag: ${flag}`);

  const fullFlag = `--${flag}=`;
  for (const input of process.argv) {
    if (input.includes(fullFlag)) return input.substring(fullFlag.length);
  }

  return undefined;
}
