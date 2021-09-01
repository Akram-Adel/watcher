import watchman from 'fb-watchman';

import errorHandler from './errorHandler';
import syncHandler, { File } from './syncHandler';
import getProject from './getProject';

type Obj = { [key: string]: any }

export const client = new watchman.Client();
export const subscriptionName = 'watchman-subscription';

export default function main(): void {
  client.capabilityCheck({ optional: [], required: ['relative_root'] }, (error) => {
    errorHandler.throwIf(error);

    client.command(['watch-project', getProject()], handleWatchCommand);
  });
}

function handleWatchCommand(error?: Error | null, resp?: any) {
  errorHandler.throwIf(error);

  /* istanbul ignore next */
  if ('warning' in resp) mainLog('WARNING', resp.warning);
  mainLog('SUCESS', 'watch established on', resp.watch, 'relative_path', resp.relative_path);

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
      mainLog('SUCESS', 'subscription', subResponse?.subscribe, 'established');
    });
  });
}

function subscribeToIssuedSubscription() {
  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach((file: File) => syncHandler.syncFile(file));
  });
}

function mainLog(type: 'SUCESS' | 'WARNING', ...log: Array<any>) {
  /* istanbul ignore next */
  const decoration = (type === 'SUCESS') ? '\x1b[42m\x1b[30m'
    : '\x1b[45m\x1b[30m';

  console.log(decoration, type, '\x1b[0m', ...log);
}

export function getSubscriptionObj(clockResponse: Obj, watchResponse?: Obj): Obj {
  return {
    expression: ['suffix', ['js', 'ts']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
    relative_root: watchResponse?.relative_path,
  };
}
