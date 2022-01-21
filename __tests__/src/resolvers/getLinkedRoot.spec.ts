import getLinkedRoot from '../../../src/resolvers/getLinkedRoot';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('project/package.json', () => ({ name: 'package.name' }), { virtual: true });
jest.mock('../../../configs.json', () => ({
  links: { link: { root: 'root/valid' } },
}));

describe('getLinkedRoot', () => {
  it('should throw when no/invalid link input', () => {
    process.argv = ['node', 'jest'];
    expect(() => getLinkedRoot('')).toThrow(/No link provided/);

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => getLinkedRoot('')).toThrow(/No link provided/);
  });

  it('should throw when provided link is not in the configuration', () => {
    process.argv = ['node', 'jest', '--link=invalid'];
    expect(() => getLinkedRoot('')).toThrow(/Provided link cannot be found/);
  });

  it('should throw when provided link doesnt have root', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ links: { link: { } } }));
    const getLinkedRootReq = require('../../../src/resolvers/getLinkedRoot').default;

    process.argv = ['node', 'jest', '--link=link'];
    expect(() => getLinkedRootReq()).toThrow(/Provided link does not have a root/);
  });

  it('should throw when link root doesnt exist', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ links: { link: { root: 'invalid' } } }));
    const getLinkedRootReq = require('../../../src/resolvers/getLinkedRoot').default;

    process.argv = ['node', 'jest', '--link=link'];
    expect(() => getLinkedRootReq()).toThrow(/Link root does not exist/);
  });

  it('should throw when linkedProject is not provided', () => {
    expect(() => getLinkedRoot(undefined)).toThrow(/Internal script error/);
  });

  it('should resolve linked root correctly provided correct input and link config', () => {
    jest.resetModules();
    jest.setMock('project/package.json', ({ name: 'package.name' }));
    expect(getLinkedRoot('project')).toBe('root/valid/node_modules/package.name');
  });
});
