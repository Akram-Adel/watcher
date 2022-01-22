import { getInputWithFlag } from '../../../src/resolvers/utils';
import getLinkedRoot from '../../../src/resolvers/getLinkedRoot';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('../../../src/resolvers/utils', () => ({
  getInputWithFlag: jest.fn(() => 'link'),
  resolveRootWithProject: jest.fn((r, p) => `${r}/node_modules/${p}`),
}));

beforeEach(() => {
  jest.resetModules();
  jest.doMock('../../../configs.json', () => ({
    links: { link: { root: 'root/valid' } },
  }));
});

describe('getLinkedRoot', () => {
  it('should throw when no/invalid link input', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(() => getLinkedRoot('')).toThrow(/No link provided/);
  });

  it('should throw when provided link is not in the configuration', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'link-invalid');

    expect(() => getLinkedRoot('')).toThrow(/Provided link cannot be found/);
  });

  it('should throw when provided link doesnt have root', () => {
    jest.setMock('../../../configs.json', ({ links: { link: { } } }));

    expect(() => getLinkedRoot('')).toThrow(/Provided link does not have a root/);
  });

  it('should throw when link root doesnt exist', () => {
    jest.setMock('../../../configs.json', ({ links: { link: { root: 'invalid' } } }));

    expect(() => getLinkedRoot('')).toThrow(/Link root does not exist/);
  });

  it('should throw when linkedProject is not provided', () => {
    expect(() => getLinkedRoot(undefined)).toThrow(/Internal script error/);
  });

  it('should resolve linked root correctly provided correct input and link config', () => {
    expect(getLinkedRoot('project')).toBe('root/valid/node_modules/project');
  });
});
