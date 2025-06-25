import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import { setPersistentUser, clearPersistentUser } from '../CopilotInstanceManager';
import { defaultBotName } from '../../types/CopilotTypes';

interface Options {
  unsetOnUnmount?: boolean;
  idOrIndex?: string | number;
}

export const useCopilotUser = (
  user: Record<string, any>,
  options?: Options
) => {
  const { setUser, unsetUser, getInstanceKey } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    const instanceKey = getInstanceKey();
    if (instanceKey) {
      // Persist user data
      setPersistentUser(instanceKey, user);
    }
    
    setUser?.(user);

    return () => {
      if (options?.unsetOnUnmount && instanceKey) {
        clearPersistentUser(instanceKey);
        unsetUser?.();
      }
    };
  }, [setUser, unsetUser, user, options?.unsetOnUnmount, getInstanceKey]);
};