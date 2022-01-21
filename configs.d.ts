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
