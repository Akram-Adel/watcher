import fs from 'fs';

import { resolveRootWithProject, getInputWithFlag } from '../../../src/resolvers/utils';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('project/package.json', () => ({ name: 'package.name' }), { virtual: true });

describe('utils.resolveRootWithProject', () => {
  it('should throw when the project doesnt have package.json file', () => {
    (fs.existsSync as jest.Mock)
      .mockImplementationOnce((i: string) => !i.includes('.json'));

    expect(() => resolveRootWithProject('root', 'project')).toThrow(/No package.json found in project/);
  });

  it('should throw when the project package.json doesnt have name property', () => {
    jest.resetModules();
    jest.setMock('project/package.json', ({ }));

    expect(() => resolveRootWithProject('root', 'project'))
      .toThrow(/Project package.json does not have name value/);
  });

  it('should resolve resolveRootWithProject correctly provided correct inputs', () => {
    jest.resetModules();
    jest.setMock('project/package.json', ({ name: 'package.name' }));
    expect(resolveRootWithProject('root', 'project')).toBe('root/node_modules/package.name');
  });
});

describe('utils.getInputFlag', () => {
  it('should throw when flag is not of correct shape', () => {
    expect(() => getInputWithFlag('not correct')).toThrow(/Invalid request flag/);
  });

  it('should return undefined when flag doesnt exist', () => {
    expect(getInputWithFlag('nonExistent')).toBe(undefined);
  });

  it('should return input when flag exists', () => {
    process.argv = ['node', 'jest', '--existent=flag'];
    expect(getInputWithFlag('existent')).toBe('flag');
  });

  it('should return undefined when input not in correct shape', () => {
    process.argv = ['node', 'jest', '--existentflag'];
    expect(getInputWithFlag('existent')).toBe(undefined);

    process.argv = ['node', 'jest', 'existent=flag'];
    expect(getInputWithFlag('existent')).toBe(undefined);
  });
});
