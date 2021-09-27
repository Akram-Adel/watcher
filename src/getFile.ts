import { File } from './syncHandler';
import configs from '../configs.json';

export default function getFile(file: File): File | undefined {
  if (noIgnoreMatchers()) return file;

  for (const pattern of configs.fileIgnorePattern) {
    if (new RegExp(pattern).test(file.name)) return undefined;
  }

  return file;
}

function noIgnoreMatchers(): boolean {
  return !configs.fileIgnorePattern || configs.fileIgnorePattern.length === 0;
}
