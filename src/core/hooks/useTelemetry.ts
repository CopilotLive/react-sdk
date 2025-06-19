import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { telemetryBus } from '../../types/telemetry/TelemetryBus';
import { throttleTime, filter } from 'rxjs/operators';
import { TelemetryStreamEvent } from '../../types/telemetry/TelemetryEvent';

interface UseTelemetryOptions {
  throttleDuration?: number; // ms
}

export function useTelemetry(): TelemetryStreamEvent[];
export function useTelemetry(groupOrEvent: string, options?: UseTelemetryOptions): TelemetryStreamEvent[];
export function useTelemetry(
  groupOrEvent?: string,
  options?: UseTelemetryOptions
): TelemetryStreamEvent[] {
  const [events, setEvents] = useState<TelemetryStreamEvent[]>([]);
  const throttleMs = options?.throttleDuration ?? 300;

  useEffect(() => {
    const sub: Subscription = telemetryBus.stream
      .pipe(
        throttleTime(throttleMs),
        filter(e => {
          if (!groupOrEvent) return true;
          if (typeof e.name !== 'string') return false;
          return e.name === groupOrEvent || e.name.startsWith(groupOrEvent + ':');
        })
      )
      .subscribe(event => {
        setEvents(prev => [...prev, event].slice(-100));
      });

    return () => sub.unsubscribe();
  }, [groupOrEvent, throttleMs]);

  return events;
}
