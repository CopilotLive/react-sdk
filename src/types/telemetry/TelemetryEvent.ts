// TelemetryEvent.ts

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

export namespace TelemetryEvent {
  export namespace Widget {
    export const Load = 'widget:load';
    export const Open = 'widget:open';
    export const Close = 'widget:close';
    export const LauncherClick = 'widget:launcher:click';
  }

  export namespace User {
    export const Message = 'user:message';
    export const MessageStop = 'user:message:stop';
  }

  export namespace Call {
    export const Connect = 'call:connect';
    export const Disconnect = 'call:disconnect';
  }

  export namespace Assistant {
    export const Message = 'assistant:message';
    export const Component = 'assistant:component';
    export const ComponentItemView = 'assistant:component:items:view';
    export const Suggestions = 'assistant:suggestions';
  }

  export const CtaClick = 'cta:click';

  export const all = {
    ...Widget,
    ...User,
    ...Call,
    ...Assistant,
    CtaClick,
  };

  export type KnownTelemetryName = typeof all[keyof typeof all];

  export function from(type: string, parameters: Parameters): BaseTelemetryEvent | OtherTelemetryEvent {
    const knownTypes = Object.values(all);

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
}

export type TelemetryStreamEvent = BaseTelemetryEvent | OtherTelemetryEvent;
