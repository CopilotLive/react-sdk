import { useEffect } from 'react';
import { useCopilot } from './useCopilot';

export const useCopilotUser = (
  user: Record<string, any>,
  options?: { unsetOnUnmount?: boolean; idOrIndex?: string | number }
) => {
  const { setUser, unsetUser } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    if (!user) {
      console.warn('[useCopilotUser] No user object provided');
      return;
    }

    setUser?.(user);

    return () => {
      if (options?.unsetOnUnmount) {
        unsetUser?.();
      }
    };
  }, [user, setUser, unsetUser]);
};