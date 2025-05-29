import { useSyncExternalStore } from 'react';
import { copilotInstances, subscribeCopilotInstances } from '../CopilotInstanceManager';
import { registeredCopilotNames } from '../../components/CopilotProvider';

export const useCopilot = (idOrIndex?: string | number) => {
  return useSyncExternalStore(
    subscribeCopilotInstances,
    () => {
      const registered = registeredCopilotNames;

      let key: string | undefined;

      if (idOrIndex === undefined) {
        key = registered[0]; // default to index 0
      } else if (typeof idOrIndex === 'number') {
        key = registered[idOrIndex];
        if (!key) {
          console.error(`[useCopilot] Invalid index: ${idOrIndex}`);
          return undefined;
        }
      } else {
        key = idOrIndex;
        if (!copilotInstances.has(key)) {
          console.error(`[useCopilot] Invalid Copilot name: "${key}"`);
          return undefined;
        }
      }

      return copilotInstances.get(key);
    },
    () => undefined
  );
};