import fs from 'fs';

import getProject from '../../../src/resolvers/getProject';
import getRoot from '../../../src/resolvers/getRoot';

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('../../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('../../../configs.json', () => ({ root: 'root' }));
jest.mock('project/package.json', () => ({ }), { virtual: true });

describe('getRoot', () => {
  it('should throw when cant get the root', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getRootReq = require('../../../src/resolvers/getRoot').default;
    expect(() => getRootReq()).toThrow('invalid project configurations');
  });

  it('should throw when cant get the project', () => {
    (getProject as jest.Mock).mockImplementationOnce(() => undefined);
    expect(() => getRoot()).toThrow('internal script error');
  });

  it('should throw when the project doesnt have package.json file', () => {
    (fs.existsSync as jest.Mock).mockImplementationOnce(() => false);
    expect(() => getRoot()).toThrow('no/invalid project package.json');
  });

  it('should throw when the project package.json doesnt have name property', () => {
    expect(() => getRoot()).toThrow('no/invalid project package.json');
  });

  it('should return root directory when all data are available', () => {
    jest.resetModules();
    jest.setMock('project/package.json', ({ name: 'project.name' }));
    expect(getRoot()).toBe('root/node_modules/project.name');
  });
});
