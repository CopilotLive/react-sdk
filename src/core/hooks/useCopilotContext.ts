import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import { setPersistentContext, clearPersistentContext } from '../CopilotInstanceManager';
import { defaultBotName } from '../../types/CopilotTypes';

interface Options {
  unsetOnUnmount?: boolean;
  idOrIndex?: string | number;
}

export const useCopilotContext = (
  context: Record<string, any>,
  options?: Options
) => {
  const { setContext, unsetContext, getInstanceKey } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    const instanceKey = getInstanceKey();
    if (instanceKey) {
      // Persist context data
      setPersistentContext(instanceKey, context);
    }
    
    setContext?.(context);

    return () => {
      if (options?.unsetOnUnmount && instanceKey) {
        clearPersistentContext(instanceKey);
        unsetContext?.();
      }
    };
  }, [setContext, unsetContext, context, options?.unsetOnUnmount, getInstanceKey]);
};