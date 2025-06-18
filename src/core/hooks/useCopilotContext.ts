import { useEffect } from 'react';
import { useCopilot } from './useCopilot';

interface Options {
  unsetOnUnmount?: boolean;
  idOrIndex?: string | number;
}

export const useCopilotContext = (
  context: Record<string, any>,
  options?: Options
) => {
  const { setContext, unsetContext } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    setContext?.(context);

    return () => {
      if (options?.unsetOnUnmount) {
        unsetContext?.();
      }
    };
  }, [setContext, unsetContext, context, options?.unsetOnUnmount]);
};