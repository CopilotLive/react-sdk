import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

declare enum CopilotMode {
    SINGLE = "single",
    MULTI = "multi"
}
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
    show?: () => void;
    hide?: () => void;
    tools?: {
        add?: (tool: ToolDefinition | ToolDefinition[]) => void;
        remove?: (name: string) => void;
        removeAll?: () => void;
    };
    users?: {
        set?: (user: Record<string, any>) => void;
        unset?: () => void;
    };
};

/**
 * Type-safe botName constraint — must match /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
 */
type SafeBotName<T extends string> = T extends `${infer First}${infer Rest}` ? First extends Lowercase<First> | Uppercase<First> | '_' | '$' ? Rest extends `${string}` ? T extends `${string}-${string}` | `${string}.${string}` | `${string} ${string}` ? never : T : never : never : never;

type SharedProps = {
    mode?: CopilotMode;
    children: React.ReactNode;
};
type SingleInstanceProps = {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: SafeBotName<string>;
} & SharedProps & {
    mode?: CopilotMode.SINGLE;
};
type MultiInstanceProps = {
    instances: {
        token: string;
        config?: Record<string, any>;
        scriptUrl?: string;
        botName?: SafeBotName<string>;
    }[];
} & SharedProps & {
    mode: CopilotMode.MULTI;
};
type Props$1 = SingleInstanceProps | MultiInstanceProps;
declare const CopilotProvider: (props: Props$1) => react_jsx_runtime.JSX.Element;

type Props = {
    tools?: ToolDefinition | ToolDefinition[];
    botName?: string;
};
declare const Copilot: ({ tools, botName }: Props) => null;

declare const getCopilotInstance: (instanceId?: string) => CopilotAPI | null;

export { Copilot, CopilotMode, CopilotProvider, getCopilotInstance };
export type { CopilotAPI, SafeBotName, ToolDefinition };
