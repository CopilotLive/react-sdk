import type { CopilotAPI } from '../types/CopilotTypes';

export const waitForCopilot = (
  botName: string,
  timeout = 5000,
  interval = 100
): Promise<CopilotAPI | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);

    let tries = 0;
    const maxTries = Math.ceil(timeout / interval);

    const check = () => {
      const copilotFn = (window as any)[botName];
      const isReady = (window as any)[`_${botName}_ready`];

      const hasRealAPI =
        typeof copilotFn === 'function' &&
        typeof copilotFn.tools?.add === 'function' &&
        typeof copilotFn.users?.set === 'function';

      if (isReady && hasRealAPI) {
        const copilotAPI: CopilotAPI = {
          show: () => copilotFn('event', 'open'),
          hide: () => copilotFn('event', 'close'),
          tools: {
            add: (tools) => copilotFn.tools.add(tools),
            remove: (name) => copilotFn.tools.remove?.(name),
            removeAll: () => copilotFn.tools.removeAll?.(),
          },
          users: {
            set: (user) => copilotFn.users.set(user),
            unset: () => copilotFn.users.unset(),
          },
        };

        return resolve(copilotAPI);
      }

      if (++tries >= maxTries) {
        console.warn(`[${botName}] Copilot not ready after timeout.`);
        return resolve(null);
      }

      setTimeout(check, interval);
    };

    check();
  });
};