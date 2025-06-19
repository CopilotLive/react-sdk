import { Subject } from 'rxjs';
import {
  TelemetryEvent,
  BaseTelemetryEvent,
  OtherTelemetryEvent,
} from '../../types/telemetry/TelemetryEvent';

type TelemetryStreamEvent = BaseTelemetryEvent | OtherTelemetryEvent;

class TelemetryBus {
  private subject = new Subject<TelemetryStreamEvent>();
  private buffer: TelemetryStreamEvent[] = [];
  private readonly MAX_BUFFER = 100;
  private initialized = false;

  emit(event: TelemetryStreamEvent) {
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

  private initializeTelemetryBridge() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    window.addEventListener('copilot:telemetry', (e: any) => {
      const detail = e.detail || {};
      const event = TelemetryEvent.from(detail.type || 'telemetry:unknown', detail.parameters || {});
      this.emit(event);
    });
  }
}

export const telemetryBus = new TelemetryBus();