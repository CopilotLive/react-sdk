import type { CopilotAPI } from '../types/CopilotTypes';

class CopilotInstanceManager {
  private instances = new Map<string, CopilotAPI>();

  set(id: string, instance: CopilotAPI) {
    this.instances.set(id, instance);
  }

  get(id: string): CopilotAPI | null {
    return this.instances.get(id) || null;
  }

  has(id: string): boolean {
    return this.instances.has(id);
  }

  getAll(): Record<string, CopilotAPI> {
    return Object.fromEntries(this.instances.entries());
  }
}

export const copilotInstances = new CopilotInstanceManager();