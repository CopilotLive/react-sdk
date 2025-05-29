export declare const useCopilotTools: (instanceId?: string) => {
    add: (tool: import("../..").ToolDefinition | import("../..").ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
} | undefined;
