export { Copilot } from './components/Copilot';
export { CopilotProvider, useCopilotProvider } from './components/CopilotProvider';
export type { SingleInstance, MultiInstance } from './components/CopilotProvider';
export type { ToolDefinition, CopilotAPI } from './types/CopilotTypes';
export type { SafeBotName } from './types/SafeBotName';
export { useCopilot } from './core/hooks/useCopilot';
export { useCopilotTool, hasHookTools } from './core/hooks/useCopilotTools';
export { useCopilotUser } from './core/hooks/useCopilotUser';
export { useTelemetry } from './core/hooks/useTelemetry'
export { telemetryBus } from './types/telemetry/TelemetryBus';
export { useCopilotContext } from './core/hooks/useCopilotContext';
