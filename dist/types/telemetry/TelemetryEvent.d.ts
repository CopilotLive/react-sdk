export interface Parameters {
    [key: string]: any;
}
export interface BaseTelemetryEvent {
    name: string;
    parameters: Parameters;
}
export interface OtherTelemetryEvent extends BaseTelemetryEvent {
    type: 'other';
    originalType: string;
}
export declare namespace TelemetryEvent {
    namespace Widget {
        const Load = "widget:load";
        const Open = "widget:open";
        const Close = "widget:close";
        const LauncherClick = "widget:launcher:click";
    }
    namespace User {
        const Message = "user:message";
        const MessageStop = "user:message:stop";
    }
    namespace Call {
        const Connect = "call:connect";
        const Disconnect = "call:disconnect";
    }
    namespace Assistant {
        const Message = "assistant:message";
        const Component = "assistant:component";
        const ComponentItemView = "assistant:component:items:view";
        const Suggestions = "assistant:suggestions";
    }
    const CtaClick = "cta:click";
    const all: {
        CtaClick: string;
        Message: "assistant:message";
        Component: "assistant:component";
        ComponentItemView: "assistant:component:items:view";
        Suggestions: "assistant:suggestions";
        Connect: "call:connect";
        Disconnect: "call:disconnect";
        MessageStop: "user:message:stop";
        Load: "widget:load";
        Open: "widget:open";
        Close: "widget:close";
        LauncherClick: "widget:launcher:click";
    };
    type KnownTelemetryName = typeof all[keyof typeof all];
    function from(type: string, parameters: Parameters): BaseTelemetryEvent | OtherTelemetryEvent;
}
export type TelemetryStreamEvent = BaseTelemetryEvent | OtherTelemetryEvent;
