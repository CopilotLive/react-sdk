import { useSyncExternalStore } from 'react';
import { copilotInstances, subscribeCopilotInstances } from '../CopilotInstanceManager';

export const useCopilot = (idOrIndex?: string | number) => {
  return useSyncExternalStore(
    subscribeCopilotInstances,
    () => {
      const allKeys = Array.from(copilotInstances.keys());

      let key: string | undefined;

      if (idOrIndex === undefined) {
        key = allKeys[0]; // default to first instance
      } else if (typeof idOrIndex === 'number') {
        key = allKeys[idOrIndex];
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