import type { CopilotAPI } from '../types/CopilotTypes';
export declare const copilotInstances: Map<string, CopilotAPI>;
export declare const subscribeCopilotInstances: (callback: () => void) => () => boolean;
export declare const notifyCopilotSubscribers: () => void;
