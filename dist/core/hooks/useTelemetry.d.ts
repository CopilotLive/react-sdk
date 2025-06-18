import { TelemetryStreamEvent } from '../../types/telemetry/TelemetryEvent';
interface UseTelemetryOptions {
    throttleDuration?: number;
}
export declare function useTelemetry(): TelemetryStreamEvent[];
export declare function useTelemetry(groupOrEvent: string, options?: UseTelemetryOptions): TelemetryStreamEvent[];
export {};
