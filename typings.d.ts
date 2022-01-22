export type Cache = { [key: string]: string }
export type File = { name: string, exists: boolean }

export type Configs = {
  fileIgnorePattern?: Array<string>;
  defaultRoot?: string;
  aliase?: { [key: string]: string };
  links?: {
    [key: string]: {
      root?: string;
      projects?: Array<string>;
    }
  };
}
