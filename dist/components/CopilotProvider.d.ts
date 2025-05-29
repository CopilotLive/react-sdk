import React from 'react';
import { CopilotMode } from '../types/CopilotTypes';
type SharedProps = {
    mode?: CopilotMode;
    children: React.ReactNode;
};
type SingleInstanceProps = {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
} & SharedProps & {
    mode?: CopilotMode.SINGLE;
};
type MultiInstanceProps = {
    instances: {
        token: string;
        config?: Record<string, any>;
        scriptUrl?: string;
        botName?: string;
    }[];
} & SharedProps & {
    mode: CopilotMode.MULTI;
};
type Props = SingleInstanceProps | MultiInstanceProps;
export declare const CopilotProvider: (props: Props) => import("react/jsx-runtime").JSX.Element;
export {};
