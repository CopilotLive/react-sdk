import { useMemo } from 'react';
import { copilotInstances } from '../CopilotInstanceManager';
import { defaultBotName, type CopilotAPI } from '../../types/CopilotTypes';
import { registeredCopilotNames } from '../../components/CopilotProvider';

export const useCopilot = (idOrIndex: string | number = defaultBotName): CopilotAPI | undefined => {
  return useMemo(() => {
    let key: string;

    if (typeof idOrIndex === 'number') {
      key = registeredCopilotNames[idOrIndex];
      if (!key) {
        console.warn(`[useCopilot] No Copilot registered at index ${idOrIndex}`);
        return undefined;
      }
    } else {
      key = idOrIndex;
    }

    const copilot = copilotInstances.get(key);
    if (!copilot) {
      console.warn(`[useCopilot] Copilot instance "${key}" not found.`);
      return undefined;
    }
    return copilot;
  }, [idOrIndex]);
};