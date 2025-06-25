import type { CopilotAPI, ToolDefinition } from '../../types/CopilotTypes';
export declare const useCopilot: (idOrIndex?: string | number) => {
    show: () => void | undefined;
    hide: () => void | undefined;
    destroy: () => void | undefined;
    addTool: (toolOrTools: ToolDefinition | ToolDefinition[]) => void;
    removeTool: (name: string) => void;
    removeAllTools: () => void | undefined;
    setUser: (user: Record<string, any>) => void;
    unsetUser: () => void;
    setContext: (context: Record<string, any>) => void;
    unsetContext: () => void;
    getInstanceKey: () => string;
    raw: CopilotAPI | undefined;
};
