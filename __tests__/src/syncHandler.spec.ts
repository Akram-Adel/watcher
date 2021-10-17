import fs from 'fs';

import syncHandler from '../../src/syncHandler';

jest.mock('fs', () => ({
  copyFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  rmSync: jest.fn(),
  rmdirSync: jest.fn(),
  readdirSync: jest.fn(() => ['file']),
}));

jest.mock('../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('../../src/resolvers/getRoot', () => jest.fn(() => 'root'));

jest.mock('../../configs.json', () => ({
  ...jest.requireActual('../../configs.json') as any,
  fileIgnorePattern: ['__tests__'],
}));

function getPath(type: 'src' | 'dist', name?: string): string {
  let path = (type === 'src') ? 'project' : 'root';
  if (name) path += `/${name}`;
  return path;
}

describe('SyncHandler', () => {
  it('should set from/to roots correctly', () => {
    expect(syncHandler.from).toBe('project');
    expect(syncHandler.to).toBe('root');
  });

  it('should ignore tests files', () => {
    syncHandler.syncFile({ name: '__tests__/name.js', exists: true });

    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.rmSync).not.toHaveBeenCalled();
  });

  it('should copy existing/new file', () => {
    const fileName = 'dir/file.js';

    syncHandler.syncFile({ name: fileName, exists: true });
    expect(fs.copyFileSync)
      .toHaveBeenCalledWith(getPath('src', fileName), getPath('dist', fileName));
  });

  it('should create new directory for new files in new directories', () => {
    (fs.existsSync as jest.Mock)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false);

    syncHandler.syncFile({ name: 'dir/file.js', exists: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith(getPath('dist', 'dir'), expect.anything());
  });

  it('should log sync operations', () => {
    const mockConsole = jest.spyOn(global.console, 'log');

    syncHandler.syncFile({ name: 'dir/file.js', exists: true });
    expect(mockConsole).toHaveBeenCalled();

    mockConsole.mockRestore();
  });

  it('should delete removed file', () => {
    syncHandler.syncFile({ name: 'dir/file.js', exists: false });
    expect(fs.rmSync).toHaveBeenCalledWith(getPath('dist', 'dir/file.js'));
  });

  it('should recusively delete file direcotries if they are empty', () => {
    (fs.readdirSync as jest.Mock)
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => []);

    syncHandler.syncFile({ name: 'dir1/dir2/file.js', exists: false });
    expect(fs.rmdirSync).toHaveBeenCalledTimes(2);
    expect(fs.rmdirSync).toHaveBeenCalledWith(getPath('dist', 'dir1/dir2'));
    expect(fs.rmdirSync).toHaveBeenCalledWith(getPath('dist', 'dir1'));
  });
});
