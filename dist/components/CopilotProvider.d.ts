import React from 'react';
export interface SingleInstance {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
}
export interface MultiInstance {
    instances: SingleInstance[];
}
interface SharedProps {
    children: React.ReactNode;
}
type CopilotProviderProps = (SingleInstance | MultiInstance) & SharedProps;
type CopilotContextType = {
    getInstanceConfig: (botName?: string | number) => SingleInstance | undefined;
};
export declare const useCopilotProvider: () => CopilotContextType;
export declare const CopilotProvider: (props: CopilotProviderProps) => import("react/jsx-runtime").JSX.Element;
export {};
