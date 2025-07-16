import { Subject } from 'rxjs';
import { TelemetryEvent, } from '../../types/telemetry/TelemetryEvent';
class TelemetryBus {
    subject = new Subject();
    buffer = [];
    MAX_BUFFER = 100;
    initialized = false;
    emit(event) {
        if (this.buffer.length >= this.MAX_BUFFER) {
            this.buffer.shift(); // Drop oldest
        }
        this.buffer.push(event);
        this.subject.next(event);
    }
    get stream() {
        this.initializeTelemetryBridge();
        return this.subject.asObservable();
    }
    initializeTelemetryBridge() {
        if (this.initialized || typeof window === 'undefined')
            return;
        this.initialized = true;
        window.addEventListener('copilot:telemetry', (e) => {
            const detail = e.detail || {};
            const event = TelemetryEvent.from(detail.type || 'telemetry:unknown', detail.parameters || {});
            this.emit(event);
        });
    }
}
export const telemetryBus = new TelemetryBus();
