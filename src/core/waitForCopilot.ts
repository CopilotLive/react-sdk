import type { CopilotAPI } from '../types/CopilotTypes';

export const waitForCopilot = (
  timeout = 5000,
  interval = 100
): Promise<CopilotAPI | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);

    let tries = 0;
    const maxTries = Math.ceil(timeout / interval);

    const check = () => {
      const copilot = (window as any).Copilot as CopilotAPI;
      if (copilot) {
        resolve(copilot);
      } else if (++tries >= maxTries) {
        console.warn('[Copilot] Timeout: Copilot not found.');
        resolve(null);
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
};