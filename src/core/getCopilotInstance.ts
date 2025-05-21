import { copilotInstances } from './CopilotInstanceManager';
import type { CopilotAPI } from '../types/CopilotTypes';

export const getCopilotInstance = (instanceId = 'default'): CopilotAPI | null =>
  copilotInstances.get(instanceId);