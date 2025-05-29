import type { CopilotAPI } from '../types/CopilotTypes';

const subscribers = new Set<() => void>();

export const copilotInstances = new Map<string, CopilotAPI>();

export const subscribeCopilotInstances = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };
  
  export const notifyCopilotSubscribers = () => {
    for (const cb of subscribers) cb();
  };