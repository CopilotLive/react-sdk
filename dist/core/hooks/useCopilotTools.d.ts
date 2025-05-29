export declare const useCopilotTools: (idOrIndex?: string | number) => {
    add: (tool: import("../..").ToolDefinition | import("../..").ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
} | undefined;
