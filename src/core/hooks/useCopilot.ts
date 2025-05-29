import { useEffect, useState } from 'react';
import { copilotInstances } from '../CopilotInstanceManager';

const MAX_WAIT_TIME = 5000; // 5 seconds timeout

export const useCopilot = (idOrIndex?: string | number) => {
  const [copilot, setCopilot] = useState<any>();
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    const interval = 100;
    const maxTries = MAX_WAIT_TIME / interval;

    let tries = 0;

    const id = setInterval(() => {
      const keys = Array.from(copilotInstances.keys());

      let key: string | undefined;

      if (idOrIndex === undefined) {
        key = keys[0];
      } else if (typeof idOrIndex === 'number') {
        key = keys[idOrIndex];
      } else {
        key = idOrIndex;
      }

      if (key && copilotInstances.has(key)) {
        setCopilot(copilotInstances.get(key));
        clearInterval(id);
        return;
      }

      tries++;
      if (tries >= maxTries) {
        setHasErrored(true);
        clearInterval(id);
      }
    }, interval);

    return () => clearInterval(id);
  }, [idOrIndex]);

  useEffect(() => {
    if (hasErrored) {
      console.error(
        `[useCopilot] Copilot instance "${String(idOrIndex ?? '0')}" not found`
      );
    }
  }, [hasErrored, idOrIndex]);

  return copilot;
};