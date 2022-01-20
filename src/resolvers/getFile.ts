import configs from '../../configs.json';
import { Configs } from '../../configs.d';

import { File } from '../syncHandler';

export default function getFile(file: File): File | undefined {
  if (noIgnoreMatchers()) return file;

  for (const pattern of (configs as Configs).fileIgnorePattern!) {
    if (new RegExp(pattern).test(file.name)) return undefined;
  }

  return file;
}

function noIgnoreMatchers(): boolean {
  return !(configs as Configs).fileIgnorePattern
    || (configs as Configs).fileIgnorePattern!.length === 0;
}
