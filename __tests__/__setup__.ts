import { doneCallback } from 'fb-watchman';

import { subscriptionName } from '../index';

console.log('>>>__setup__<<<');

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
