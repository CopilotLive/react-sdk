import { useEffect } from 'react';
import { useCopilot } from './useCopilot';

interface Options {
  unsetOnUnmount?: boolean;
  idOrIndex?: string | number;
}

export const useCopilotUser = (
  user: Record<string, any>,
  options?: Options
) => {
  const { setUser, unsetUser } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    setUser?.(user);

    return () => {
      if (options?.unsetOnUnmount) {
        unsetUser?.();
      }
    };
  }, [setUser, unsetUser, user, options?.unsetOnUnmount]);
};