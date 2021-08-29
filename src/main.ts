import watchman from 'fb-watchman';

import errorHandler from './errorHandler';
import syncHandler, { File } from './syncHandler';
import dirResolver from './dirResolver';

type Obj = { [key: string]: any }

export const client = new watchman.Client();
export const subscriptionName = 'watchman-subscription';

export default function main(): void {
  client.capabilityCheck({ optional: [], required: ['relative_root'] }, (error) => {
    errorHandler.throwIf(error);

    client.command(['watch-project', dirResolver()], handleWatchCommand);
  });
}

function handleWatchCommand(error?: Error | null, resp?: any) {
  errorHandler.throwIf(error);

  /* istanbul ignore next */
  if ('warning' in resp) {
    console.log('\x1b[45m\x1b[30m', 'WARNING', '\x1b[0m',
      resp.warning);
  }

  console.log('\x1b[42m\x1b[30m', 'SUCCESS', '\x1b[0m',
    'watch established on ', resp.watch, ' relative_path', resp.relative_path);

  issueClockedSubscription(resp);
  subscribeToIssuedSubscription();
}

function issueClockedSubscription(watchResponse: any) {
  client.command(['clock', watchResponse.watch], (clockError, clockResponse) => {
    errorHandler.throwIf(clockError);

    const subscribeCommand = [
      'subscribe',
      watchResponse.watch,
      subscriptionName,
      getSubscriptionObj(clockResponse, watchResponse),
    ];

    client.command(subscribeCommand, (subError, subResponse) => {
      errorHandler.throwIf(subError);

      /* istanbul ignore next */
      console.log('\x1b[42m\x1b[30m', 'SUCCESS', '\x1b[0m',
        'subscription', subResponse?.subscribe, 'established');
    });
  });
}

function subscribeToIssuedSubscription() {
  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach((file: File) => syncHandler.syncFile(file));
  });
}

export function getSubscriptionObj(clockResponse: Obj, watchResponse?: Obj): Obj {
  return {
    expression: ['suffix', ['js', 'ts']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
    relative_root: watchResponse?.relative_path,
  };
}
