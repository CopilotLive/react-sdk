import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface SharedProps {
    children: React.ReactNode;
}
interface SingleInstance {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
}
interface MultiInstance {
    instances: SingleInstance[];
}
type CopilotProviderProps = (SingleInstance | MultiInstance) & SharedProps;
declare const CopilotProvider: (props: CopilotProviderProps) => react_jsx_runtime.JSX.Element;

type ToolParameter = {
    type: string;
    description?: string;
};
type ToolDefinition = {
    name: string;
    description: string;
    parameters?: {
        type: 'object';
        properties: Record<string, ToolParameter>;
        required?: string[];
    };
    timeout?: number;
    handler: (args: Record<string, any>) => Promise<any> | any;
};
type CopilotAPI = {
    show: () => void;
    hide: () => void;
    tools: {
        add: (tool: ToolDefinition | ToolDefinition[]) => void;
        remove: (name: string) => void;
        removeAll?: () => void;
    };
    users: {
        set: (user: Record<string, any>) => void;
        unset: () => void;
    };
};

type Props = {
    tools?: ToolDefinition | ToolDefinition[];
    botName?: string;
};
declare const Copilot: ({ tools, botName }: Props) => null;

/**
 * Type-safe botName constraint — must match /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
 */
type SafeBotName<T extends string> = T extends `${infer First}${infer Rest}` ? First extends Lowercase<First> | Uppercase<First> | '_' | '$' ? Rest extends `${string}` ? T extends `${string}-${string}` | `${string}.${string}` | `${string} ${string}` ? never : T : never : never : never;

declare const useCopilot: (instanceId?: string) => CopilotAPI | undefined;

declare const useCopilotTools: (instanceId?: string) => {
    add: (tool: ToolDefinition | ToolDefinition[]) => void;
    remove: (name: string) => void;
    removeAll?: () => void;
} | undefined;

declare const useCopilotUser: (instanceId?: string) => {
    set: (user: Record<string, any>) => void;
    unset: () => void;
} | undefined;

export { Copilot, CopilotProvider, useCopilot, useCopilotTools, useCopilotUser };
export type { CopilotAPI, SafeBotName, ToolDefinition };
