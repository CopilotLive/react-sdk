import type { CopilotAPI, ToolDefinition } from '../types/CopilotTypes';
interface PersistentHookData {
    user?: Record<string, any>;
    context?: Record<string, any>;
    tools?: ToolDefinition[];
}
export declare const copilotInstances: Map<string, CopilotAPI>;
export declare const persistentHookData: Map<string, PersistentHookData>;
export declare const setPersistentUser: (instanceKey: string, user: Record<string, any>) => void;
export declare const setPersistentContext: (instanceKey: string, context: Record<string, any>) => void;
export declare const addPersistentTool: (instanceKey: string, tool: ToolDefinition) => void;
export declare const addPersistentTools: (instanceKey: string, tools: ToolDefinition[]) => void;
export declare const removePersistentTool: (instanceKey: string, toolName: string) => void;
export declare const clearPersistentTools: (instanceKey: string) => void;
export declare const getPersistentData: (instanceKey: string) => PersistentHookData | undefined;
export declare const clearPersistentUser: (instanceKey: string) => void;
export declare const clearPersistentContext: (instanceKey: string) => void;
export declare const restorePersistentData: (instanceKey: string, copilot: CopilotAPI) => void;
export {};
