import fs from 'fs';

import syncHandler from '../../src/syncHandler';
import configs from '../../configs.json';

jest.mock('fs', () => ({
  copyFileSync: jest.fn(),
  existsSync: jest.fn()
    .mockImplementationOnce(() => true)
    .mockImplementationOnce(() => false)
    .mockImplementationOnce(() => false)
    .mockImplementation(() => true),
  mkdirSync: jest.fn(),
  rmSync: jest.fn(),
  rmdirSync: jest.fn(),
  readdirSync: jest.fn()
    .mockImplementationOnce(() => ['file'])
    .mockImplementationOnce(() => [])
    .mockImplementationOnce(() => [])
    .mockImplementation(() => ['file']),
}));

jest.mock('../../src/dirResolver', () => jest.fn(() => 'REMOVED-ACTUAL-project'));

function getFile(type: 'src' | 'dist', f?: string): string {
  let file = (type === 'src')
    ? 'REMOVED-ACTUAL-project'
    : `${configs.root}project`;

  if (f) file += `/${f}`;
  return file;
}

describe('SyncHandler', () => {
  it('should throw when root configuration it not defined', () => {
    jest.resetModules();
    jest.setMock('../../configs.json', ({ }));
    expect(() => require('../../src/syncHandler').default).toThrow();
  });

  it('should set from/to roots correctly', () => {
    expect(syncHandler.from).toBe('REMOVED-ACTUAL-project');
    expect(syncHandler.to).toBe(`${configs.root}project`);
  });

  /** @calls existsSync */
  it('should copy existing/new file', () => {
    const fileName = 'dir/file.js';

    syncHandler.syncFile({ name: fileName, exists: true });
    expect(fs.copyFileSync)
      .toHaveBeenCalledWith(getFile('src', fileName), getFile('dist', fileName));

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
  });

  /** @calls existsSync x2 */
  it('should create new directory for new files in new directories', () => {
    syncHandler.syncFile({ name: 'dir/file.js', exists: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith(getFile('dist', 'dir'), expect.anything());

    expect(fs.existsSync).toHaveBeenCalledTimes(2);
  });

  /** @calls existsSync */
  it('should log sync operations', () => {
    const mockConsole = jest.spyOn(global.console, 'log');

    syncHandler.syncFile({ name: 'dir/file.js', exists: true });
    expect(mockConsole).toHaveBeenCalled();

    expect(fs.existsSync).toHaveBeenCalledTimes(1);

    mockConsole.mockRestore();
  });

  /** @calls existsSync */
  /** @calls readdirSync */
  it('should delete removed file', () => {
    const fileName = 'dir/file.js';

    syncHandler.syncFile({ name: fileName, exists: false });
    expect(fs.rmSync).toHaveBeenCalledWith(getFile('dist', fileName));

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.readdirSync).toHaveBeenCalledTimes(1);
  });

  /** @calls existsSync */
  /** @calls readdirSync x2 */
  it('should recusively delete file direcotries if they are empty', () => {
    const fileName = 'dir1/dir2/file.js';

    syncHandler.syncFile({ name: fileName, exists: false });
    expect(fs.rmdirSync).toHaveBeenCalledTimes(2);
    expect(fs.rmdirSync).toHaveBeenCalledWith(getFile('dist', 'dir1/dir2'));
    expect(fs.rmdirSync).toHaveBeenCalledWith(getFile('dist', 'dir1'));

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
  });
});
