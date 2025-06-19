import type { CopilotAPI } from '../types/CopilotTypes';
import { copilotInstances } from '../core/CopilotInstanceManager';

export const waitForCopilot = (
  botName: string,
  timeout = 5000,
  interval = 100
): Promise<CopilotAPI | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);

    let tries = 0;
    const maxTries = Math.ceil(timeout / interval);

    const scriptId = `copilot-loader-script${botName === 'copilot' ? '' : `-${botName}`}`;

    const cleanup = () => {
      const windowAny = window as any;
        if(windowAny[`_${botName}_ready`]) {
          windowAny[botName]?.("destroy");
          windowAny[botName] = null;
          windowAny[`_${botName}_ready`] = false;
          copilotInstances.delete(botName);
          
          const element = document.getElementById(scriptId);
          const elementObjet = document.getElementById(botName);
          if (element) {
            element.remove();
            elementObjet?.remove();
          }
        }
    }

    const check = () => {
      const copilotFn = (window as any)[botName];
      const isReady = (window as any)[`_${botName}_ready`];

      const hasRealAPI =
        typeof copilotFn === 'function' &&
        typeof copilotFn.tools?.add === 'function' &&
        typeof copilotFn.users?.set === 'function' &&
        typeof copilotFn.context?.set === 'function';

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
          context: {
            set: (context) => copilotFn.context.set(context),
            unset: () => copilotFn.context.unset(),
          },
          destroy: () => cleanup(),
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