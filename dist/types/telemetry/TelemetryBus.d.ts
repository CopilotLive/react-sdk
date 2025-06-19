import { BaseTelemetryEvent, OtherTelemetryEvent } from '../../types/telemetry/TelemetryEvent';
type TelemetryStreamEvent = BaseTelemetryEvent | OtherTelemetryEvent;
declare class TelemetryBus {
    private subject;
    private buffer;
    private readonly MAX_BUFFER;
    private initialized;
    emit(event: TelemetryStreamEvent): void;
    get stream(): import("rxjs").Observable<TelemetryStreamEvent>;
    private initializeTelemetryBridge;
}
export declare const telemetryBus: TelemetryBus;
export {};
