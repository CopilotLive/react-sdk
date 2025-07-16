import { useEffect, useState } from 'react';
import { telemetryBus } from '../../types/telemetry/TelemetryBus';
import { throttleTime, filter } from 'rxjs/operators';
export function useTelemetry(groupOrEvent, options) {
    const [events, setEvents] = useState([]);
    const throttleMs = options?.throttleDuration ?? 300;
    useEffect(() => {
        const sub = telemetryBus.stream
            .pipe(throttleTime(throttleMs), filter(e => {
            if (!groupOrEvent)
                return true;
            if (typeof e.name !== 'string')
                return false;
            return e.name === groupOrEvent || e.name.startsWith(groupOrEvent + ':');
        }))
            .subscribe(event => {
            setEvents(prev => [...prev, event].slice(-100));
        });
        return () => sub.unsubscribe();
    }, [groupOrEvent, throttleMs]);
    return events;
}
