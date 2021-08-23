import { doneCallback } from 'fb-watchman';

import main, {
  client, syncHandler, subscriptionName, getSubscriptionObj,
} from '../index';

const mockDir = `${process.env.HOME}/Documents`;
const mockWatchResponse = { watch: mockDir, relative_path: 'root' };
const mockClockResponse = { clock: 100 };
const mockOnSubscription = { subscription: subscriptionName, files: [{ name: 'any' }] };

jest.mock('fb-watchman', () => ({
  Client: jest.fn().mockImplementation(() => ({
    capabilityCheck: jest.fn()
      .mockImplementationOnce((_, fn) => fn(new Error('capabilityCheck error')))
      .mockImplementation((_, fn) => fn()),
    command: jest.fn()
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce((_, fn) => fn(new Error('command error')))
      .mockImplementation((commands: Array<string>, fn: doneCallback) => {
        if (commands.indexOf('watch-project') !== -1) fn(null, mockWatchResponse);
        else if (commands.indexOf('clock') !== -1) fn(null, mockClockResponse);
        else fn(null);
      }),
    on: jest.fn()
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce((_, fn) => fn({ subscription: 'any' }))
      .mockImplementation((_, fn) => fn(mockOnSubscription)),
  })),
}));

jest.mock('../syncHandler', () => jest.fn().mockImplementation(() => ({
  setDir: jest.fn(),
  syncFile: jest.fn(),
})));

beforeEach(() => {
  process.argv = ['node', 'jest', mockDir];
});

describe('index', () => {
  it('should throw error when watchman capabilities has an error', () => {
    expect(() => main()).toThrow(/capabilityCheck error/);
  });

  it('should throw error when no/invalid directory is provided', () => {
    process.argv = ['node', 'jest'];
    expect(() => main()).toThrow(/no\/invalid directory.+provided/);

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => main()).toThrow(/no\/invalid directory.+provided/);
  });

  it('should issue watch command when a directory is provided', () => {
    const watchCommand = [['watch-project', mockDir], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...watchCommand);
  });

  it('should throw error when watch command fails', () => {
    expect(() => main()).toThrow(/command error/);
  });

  it('can create clocked subscription object', () => {
    const clockedSubscriptionObj = {
      expression: ['suffix', ['js', 'ts']],
      fields: ['name', 'exists'],
      since: mockClockResponse.clock,
      relative_root: mockWatchResponse.relative_path,
    };

    const subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    expect(subscriptionObj).toEqual(clockedSubscriptionObj);
  });

  it('should set directory of syncHandler when watch command succeed', () => {
    main();
    expect(syncHandler.setDir).toHaveBeenCalledWith(mockDir);
  });

  it('should issue clocked subscribe command when watch command succeed', () => {
    const clockCommand = [['clock', expect.anything()], expect.anything()];
    const subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    const subscribeCommand = [['subscribe', mockDir, expect.anything(), subscriptionObj], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...clockCommand);
    expect(client.command).toHaveBeenCalledWith(...subscribeCommand);
  });

  it('should subscribe to client events', () => {
    main();
    expect(client.on).toHaveBeenCalledWith('subscription', expect.anything());
  });

  it('should not respond to any subscriptions other than issued ones', () => {
    main();
    expect(syncHandler.syncFile).not.toHaveBeenCalled();

    main();
    expect(syncHandler.syncFile).toHaveBeenCalledWith(mockOnSubscription.files[0]);
  });
});
