// TelemetryEvent.ts
export var TelemetryEvent;
(function (TelemetryEvent) {
    let Widget;
    (function (Widget) {
        Widget.Load = 'widget:load';
        Widget.Open = 'widget:open';
        Widget.Close = 'widget:close';
        Widget.LauncherClick = 'widget:launcher:click';
    })(Widget = TelemetryEvent.Widget || (TelemetryEvent.Widget = {}));
    let User;
    (function (User) {
        User.Message = 'user:message';
        User.MessageStop = 'user:message:stop';
    })(User = TelemetryEvent.User || (TelemetryEvent.User = {}));
    let Call;
    (function (Call) {
        Call.Connect = 'call:connect';
        Call.Disconnect = 'call:disconnect';
    })(Call = TelemetryEvent.Call || (TelemetryEvent.Call = {}));
    let Assistant;
    (function (Assistant) {
        Assistant.Message = 'assistant:message';
        Assistant.Component = 'assistant:component';
        Assistant.ComponentItemView = 'assistant:component:items:view';
        Assistant.Suggestions = 'assistant:suggestions';
    })(Assistant = TelemetryEvent.Assistant || (TelemetryEvent.Assistant = {}));
    TelemetryEvent.CtaClick = 'cta:click';
    TelemetryEvent.all = {
        ...Widget,
        ...User,
        ...Call,
        ...Assistant,
        CtaClick: TelemetryEvent.CtaClick,
    };
    function from(type, parameters) {
        const knownTypes = Object.values(TelemetryEvent.all);
        if (knownTypes.includes(type)) {
            return {
                name: type,
                parameters,
            };
        }
        return {
            type: 'other',
            name: 'telemetry:other',
            originalType: type,
            parameters,
        };
    }
    TelemetryEvent.from = from;
})(TelemetryEvent || (TelemetryEvent = {}));
