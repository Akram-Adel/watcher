import getProject from '../../../src/resolvers/getProject';
import getRoot from '../../../src/resolvers/getRoot';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('../../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('project/package.json', () => ({ name: 'package.name' }), { virtual: true });
jest.mock('../../../configs.json', () => ({
  defaultRoot: 'default/valid',
  aliase: { aliase: 'resolved/valid' },
}));

describe('getRoot', () => {
  it('should throw when no defaultRoot config and no root input', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;

    expect(() => getRootReq()).toThrow(/No root provided/);
  });

  it('should resolve root when provided defaultRoot and no root input', () => {
    expect(getRoot()).toBe('default/valid/node_modules/package.name');
  });

  it('should throw when no root input and provided defaultRoot is invalid', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ defaultRoot: 'default/invalid' }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;

    expect(() => getRootReq()).toThrow(/Root does not exist/);
  });

  it('should resolve root when no aliases in configuration and input dir is valid', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;

    process.argv = ['node', 'jest', '--root=valid'];
    expect(getRootReq()).toBe('valid/node_modules/package.name');
  });

  it('should throw when no aliases in configuration and input dir is invalid', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;

    process.argv = ['node', 'jest', '--root=invalid'];
    expect(() => getRootReq()).toThrow(/Root does not exist/);
  });

  it('should resolve aliase input', () => {
    process.argv = ['node', 'jest', '--root=aliase'];
    expect(getRoot()).toBe('resolved/valid/node_modules/package.name');
  });

  it('should throw when resolved aliase is invalid directory', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ aliase: { aliase: 'resolved/invalid' } }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;

    process.argv = ['node', 'jest', '--root=aliase'];
    expect(() => getRootReq()).toThrow(/Root does not exist/);
  });

  it('should resolve root when aliases is provided but doesnt match input', () => {
    process.argv = ['node', 'jest', '--root=valid'];
    expect(getRoot()).toBe('valid/node_modules/package.name');
  });

  it('should throw when cant get the project', () => {
    (getProject as jest.Mock).mockImplementationOnce(() => undefined);
    expect(() => getRoot()).toThrow(/Internal script error/);
  });
});
