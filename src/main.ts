import watchman from 'fb-watchman';

import syncHandler, { File } from './syncHandler';
import getProject from './resolvers/getProject';

export const client = new watchman.Client();
export const subscriptionName = 'watcher-subscription';

export default function main(): void {
  const capabilityChecks = ['relative_root', 'suffix-set'];
  client.capabilityCheck({ optional: [], required: capabilityChecks }, (error) => {
    throwIf(error);

    client.command(['watch-project', getProject()], handleWatchCommand);
  });
}

function handleWatchCommand(error?: Error | null, resp?: any) {
  throwIf(error);

  /* istanbul ignore next */
  if ('warning' in resp) mainLog('WARNING', resp.warning);
  mainLog('SUCESS', 'watch established on', resp.watch, 'relative_path', resp.relative_path);

  issueClockedSubscription(resp);
  subscribeToIssuedSubscription();
}

function issueClockedSubscription(resp?: any) {
  client.command(['clock', resp.watch], (clockError?: Error | null, clockResponse?: any) => {
    throwIf(clockError);

    const subscribeCommand = [
      'subscribe',
      resp.watch,
      subscriptionName,
      getSubscriptionObj(clockResponse, resp),
    ];

    client.command(subscribeCommand, (subError?: Error | null, subResponse?: any) => {
      throwIf(subError);

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

type Obj = { [key: string]: any }
export function getSubscriptionObj(clockResponse: Obj, watchResponse?: Obj): Obj {
  return {
    expression: ['suffix', ['js', 'ts']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
    relative_root: watchResponse?.relative_path,
  };
}

function throwIf(error?: Error | null): void | never {
  if (error) throw error;
}

function mainLog(type: 'SUCESS' | 'WARNING', ...log: Array<any>) {
  /* istanbul ignore next */
  const decoration = (type === 'SUCESS') ? '\x1b[42m\x1b[30m'
    : '\x1b[45m\x1b[30m';

  console.log(decoration, type, '\x1b[0m', ...log);
}
