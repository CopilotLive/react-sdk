import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';
import * as rxjs from 'rxjs';

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
    destroy: () => void;
    tools: {
        add: (tool: ToolDefinition | ToolDefinition[]) => void;
        remove: (name: string) => void;
        removeAll?: () => void;
    };
    users: {
        set: (user: Record<string, any>) => void;
        unset: () => void;
    };
    context: {
        set: (context: Record<string, any>) => void;
        unset: () => void;
    };
};

type Props = {
    tools?: ToolDefinition | ToolDefinition[];
    botName?: string | number;
};
declare const Copilot: ({ tools, botName }: Props) => null;

interface SingleInstance {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
}
interface MultiInstance {
    instances: SingleInstance[];
}
interface SharedProps {
    children: React.ReactNode;
}
type CopilotProviderProps = (SingleInstance | MultiInstance) & SharedProps;
type CopilotContextType = {
    getInstanceConfig: (botName?: string | number) => SingleInstance | undefined;
};
declare const useCopilotProvider: () => CopilotContextType;
declare const CopilotProvider: (props: CopilotProviderProps) => react_jsx_runtime.JSX.Element;

/**
 * Type-safe botName constraint — must match /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
 */
type SafeBotName<T extends string> = T extends `${infer First}${infer Rest}` ? First extends Lowercase<First> | Uppercase<First> | '_' | '$' ? Rest extends `${string}` ? T extends `${string}-${string}` | `${string}.${string}` | `${string} ${string}` ? never : T : never : never : never;

declare const useCopilot: (idOrIndex?: string | number) => {
    show: () => void | undefined;
    hide: () => void | undefined;
    destroy: () => void | undefined;
    addTool: (toolOrTools: ToolDefinition | ToolDefinition[]) => void;
    removeTool: (name: string) => void | undefined;
    removeAllTools: () => void | undefined;
    setUser: (user: Record<string, any>) => void | undefined;
    unsetUser: () => void | undefined;
    setContext: (context: Record<string, any>) => void | undefined;
    unsetContext: () => void | undefined;
    raw: CopilotAPI | undefined;
};

interface Options$2 {
    removeOnUnmount?: boolean;
    idOrIndex?: string | number;
}
declare const useCopilotTool: (toolOrTools: ToolDefinition | ToolDefinition[], options?: Options$2) => void;
declare const hasHookTools: (idOrIndex?: string | number) => boolean;

interface Options$1 {
    unsetOnUnmount?: boolean;
    idOrIndex?: string | number;
}
declare const useCopilotUser: (user: Record<string, any>, options?: Options$1) => void;

interface Parameters {
    [key: string]: any;
}
interface BaseTelemetryEvent {
    name: string;
    parameters: Parameters;
}
interface OtherTelemetryEvent extends BaseTelemetryEvent {
    type: 'other';
    originalType: string;
}
type TelemetryStreamEvent$1 = BaseTelemetryEvent | OtherTelemetryEvent;

interface UseTelemetryOptions {
    throttleDuration?: number;
}
declare function useTelemetry(): TelemetryStreamEvent$1[];
declare function useTelemetry(groupOrEvent: string, options?: UseTelemetryOptions): TelemetryStreamEvent$1[];

type TelemetryStreamEvent = BaseTelemetryEvent | OtherTelemetryEvent;
declare class TelemetryBus {
    private subject;
    private buffer;
    private readonly MAX_BUFFER;
    private initialized;
    emit(event: TelemetryStreamEvent): void;
    get stream(): rxjs.Observable<TelemetryStreamEvent>;
    private initializeTelemetryBridge;
}
declare const telemetryBus: TelemetryBus;

interface Options {
    unsetOnUnmount?: boolean;
    idOrIndex?: string | number;
}
declare const useCopilotContext: (context: Record<string, any>, options?: Options) => void;

export { Copilot, CopilotProvider, hasHookTools, telemetryBus, useCopilot, useCopilotContext, useCopilotProvider, useCopilotTool, useCopilotUser, useTelemetry };
export type { CopilotAPI, MultiInstance, SafeBotName, SingleInstance, ToolDefinition };
