export type File = { name: string, exists: boolean }

export default class SyncHandler {
  private fromRoot?: string
  private toRoot?: string

  setDir(dir: string): void {
    this.fromRoot = dir;

    const dirArray = dir.split('/');
    const project = dirArray[dirArray.length - 1].substr(String('REMOVED-ACTUAL-').length).toLocaleLowerCase();
    this.toRoot = `/Users/akram-adel/Documents/REMOVED-ACTUAL/REMOVED-ACTUAL-${project}`;
  }

  syncFile(_file: File): void {
    console.log('hiiii');
  }
}
