import { useMemo } from 'react';
import { copilotInstances } from '../CopilotInstanceManager';
import type { CopilotAPI } from '../../types/CopilotTypes';

export const useCopilot = (instanceId: string = 'default'): CopilotAPI | undefined => {
  return useMemo(() => {
    const copilot = copilotInstances.get(instanceId);
    if (!copilot) {
      console.warn(`[useCopilot] Copilot instance "${instanceId}" not found.`);
      return undefined;
    }
    return copilot;
  }, [instanceId]);
};