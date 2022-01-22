import { File, Configs } from '../../typings.d';

export default function getFile(file: File): File | undefined {
  if (noIgnoreMatchers()) return file;

  const configs = require('../../configs.json') as Configs;
  for (const pattern of configs.fileIgnorePattern!) {
    if (new RegExp(pattern).test(file.name)) return undefined;
  }

  return file;
}

function noIgnoreMatchers(): boolean {
  const configs = require('../../configs.json') as Configs;

  return !configs.fileIgnorePattern
    || configs.fileIgnorePattern!.length === 0;
}
