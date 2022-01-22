import { getInputWithFlag } from '../../../src/resolvers/utils';
import getProject from '../../../src/resolvers/getProject';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('../../../src/resolvers/utils', () => ({
  getInputWithFlag: jest.fn(() => 'project'),
}));

beforeEach(() => {
  jest.resetModules();
  jest.doMock('../../../configs.json', () => ({
    aliase: { aliase: 'aliase/valid' },
  }));
});

describe('getProject', () => {
  it('should throw when no/invalid project input', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(() => getProject()).toThrow(/No project provided/);
  });

  it('should return input dir when no aliases in configuration and input dir is valid', () => {
    jest.setMock('../../../configs.json', ({ }));

    expect(getProject()).toBe('project');
  });

  it('should throw when no aliases in configuration and input dir is invalid', () => {
    jest.setMock('../../../configs.json', ({ }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'invalid');

    expect(() => getProject()).toThrow(/Project does not exist/);
  });

  it('should resolve aliase inputs', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'aliase');

    expect(getProject()).toBe('aliase/valid');
  });

  it('should throw when resolved aliase is invalid directory', () => {
    jest.setMock('../../../configs.json', ({ aliase: { aliase: 'aliase/invalid' } }));
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'aliase');

    expect(() => getProject()).toThrow(/Project does not exist/);
  });

  it('should resolve root when aliases is provided but doesnt match input', () => {
    expect(getProject()).toBe('project');
  });
});
