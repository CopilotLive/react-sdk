export declare const useCopilotTools: (instanceId?: string) => {
    add: (tool: import("../../types/CopilotTypes").ToolDefinition | import("../../types/CopilotTypes").ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
} | undefined;
