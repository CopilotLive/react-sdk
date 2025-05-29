export declare const useCopilotTools: (idOrIndex?: string | number) => {
    add: (tool: import("../../types/CopilotTypes").ToolDefinition | import("../../types/CopilotTypes").ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
} | undefined;
