import getProject from '../../../src/resolvers/getProject';
import { getInputWithFlag } from '../../../src/resolvers/utils';
import getRoot from '../../../src/resolvers/getRoot';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('../../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('../../../src/resolvers/utils', () => ({
  getInputWithFlag: jest.fn(() => 'root'),
  resolveRootWithProject: jest.fn((r, p) => `${r}/node_modules/${p}`),
}));

beforeEach(() => {
  jest.resetModules();
  jest.doMock('../../../configs.json', () => ({
    defaultRoot: 'default/root',
    aliase: { aliase: 'aliase/valid' },
  }));
});

describe('getRoot', () => {
  it('should throw when no defaultRoot config and no root input', () => {
    jest.doMock('../../../configs.json', () => ({ }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(() => getRoot()).toThrow(/No root provided/);
  });

  it('should resolve root when provided defaultRoot and no root input', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(getRoot()).toBe('default/root/node_modules/project');
  });

  it('should throw when no root input and provided defaultRoot is invalid', () => {
    jest.setMock('../../../configs.json', ({ defaultRoot: 'default/invalid' }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(() => getRoot()).toThrow(/Root does not exist/);
  });

  it('should resolve root when no aliases in configuration and input dir is valid', () => {
    jest.setMock('../../../configs.json', ({ }));

    expect(getRoot()).toBe('root/node_modules/project');
  });

  it('should throw when no aliases in configuration and input dir is invalid', () => {
    jest.setMock('../../../configs.json', ({ }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'invalid');

    expect(() => getRoot()).toThrow(/Root does not exist/);
  });

  it('should resolve aliase input', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'aliase');

    expect(getRoot()).toBe('aliase/valid/node_modules/project');
  });

  it('should throw when resolved aliase is invalid directory', () => {
    jest.setMock('../../../configs.json', ({ aliase: { aliase: 'aliase/invalid' } }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'aliase');

    expect(() => getRoot()).toThrow(/Root does not exist/);
  });

  it('should resolve root when aliases is provided but doesnt match input', () => {
    expect(getRoot()).toBe('root/node_modules/project');
  });

  it('should throw when cant get the project', () => {
    (getProject as jest.Mock).mockImplementationOnce(() => undefined);
    expect(() => getRoot()).toThrow(/Internal script error/);
  });
});
