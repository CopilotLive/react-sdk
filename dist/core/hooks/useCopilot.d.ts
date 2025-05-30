import { CopilotAPI, ToolDefinition } from '../../types/CopilotTypes';
export declare const useCopilot: (idOrIndex?: string | number) => {
    show: () => void | undefined;
    hide: () => void | undefined;
    addTool: (tool: ToolDefinition | ToolDefinition[]) => void | undefined;
    removeTool: (name: string) => void | undefined;
    removeAllTools: () => void | undefined;
    setUser: (user: Record<string, any>) => void | undefined;
    unsetUser: () => void | undefined;
    raw: CopilotAPI | undefined;
};
