import type { CopilotAPI } from '../types/CopilotTypes';
declare class CopilotInstanceManager {
    private instances;
    set(id: string, instance: CopilotAPI): void;
    get(id: string): CopilotAPI | null;
    has(id: string): boolean;
    getAll(): Record<string, CopilotAPI>;
}
export declare const copilotInstances: CopilotInstanceManager;
export {};
