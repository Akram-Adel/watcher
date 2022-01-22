import { getInputWithFlag } from '../../../src/resolvers/utils';
import getLinkedProject from '../../../src/resolvers/getLinkedProjects';

jest.mock('../../../configs.json', () => ({
  links: { link: { projects: ['project/valid'] } },
}));

jest.mock('../../../src/resolvers/utils', () => ({
  getInputWithFlag: jest.fn(() => 'link'),
}));

beforeEach(() => {
  jest.resetModules();
  jest.doMock('../../../configs.json', () => ({
    links: { link: { projects: ['project/valid'] } },
  }));
});

describe('getLinkedProjects', () => {
  it('should throw when no/invalid link input', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => undefined);

    expect(() => getLinkedProject()).toThrow(/No link provided/);
  });

  it('should throw when provided link is not in the configuration', () => {
    (getInputWithFlag as jest.Mock).mockImplementationOnce(() => 'link-invalid');

    expect(() => getLinkedProject()).toThrow(/Provided link cannot be found/);
  });

  it('should throw when provided link doesnt have projects', () => {
    jest.setMock('../../../configs.json', ({ links: { link: { } } }));

    expect(() => getLinkedProject()).toThrow(/Provided link does not have projects/);
  });

  it('should resolve linked projects correctly provided correct link config', () => {
    expect(getLinkedProject()).toEqual(['project/valid']);
  });
});
