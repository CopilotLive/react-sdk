import type { ToolDefinition } from '../../types/CopilotTypes';
export declare const useCopilotTool: (tool: ToolDefinition, options?: {
    removeOnUnmount?: boolean;
    idOrIndex?: string | number;
}) => void;
