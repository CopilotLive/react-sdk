import type { CopilotAPI, ToolDefinition } from '../types/CopilotTypes';

// Store for persisting hook values across widget destruction/recreation
interface PersistentHookData {
  user?: Record<string, any>;
  context?: Record<string, any>;
  tools?: ToolDefinition[];
}

export const copilotInstances = new Map<string, CopilotAPI>();
export const persistentHookData = new Map<string, PersistentHookData>();

// Helper functions to manage persistent data
export const setPersistentUser = (instanceKey: string, user: Record<string, any>) => {
  const data = persistentHookData.get(instanceKey) || {};
  data.user = user;
  persistentHookData.set(instanceKey, data);
};

export const setPersistentContext = (instanceKey: string, context: Record<string, any>) => {
  const data = persistentHookData.get(instanceKey) || {};
  data.context = context;
  persistentHookData.set(instanceKey, data);
};

export const addPersistentTool = (instanceKey: string, tool: ToolDefinition) => {
  const data = persistentHookData.get(instanceKey) || {};
  if (!data.tools) data.tools = [];
  // Remove existing tool with same name, then add new one
  data.tools = data.tools.filter(t => t.name !== tool.name);
  data.tools.push(tool);
  persistentHookData.set(instanceKey, data);
};

export const removePersistentTool = (instanceKey: string, toolName: string) => {
  const data = persistentHookData.get(instanceKey);
  if (data?.tools) {
    data.tools = data.tools.filter(t => t.name !== toolName);
    persistentHookData.set(instanceKey, data);
  }
};

export const clearPersistentTools = (instanceKey: string) => {
  const data = persistentHookData.get(instanceKey);
  if (data) {
    data.tools = [];
    persistentHookData.set(instanceKey, data);
  }
};

export const getPersistentData = (instanceKey: string): PersistentHookData | undefined => {
  return persistentHookData.get(instanceKey);
};

export const clearPersistentUser = (instanceKey: string) => {
  const data = persistentHookData.get(instanceKey);
  if (data) {
    delete data.user;
    persistentHookData.set(instanceKey, data);
  }
};

export const clearPersistentContext = (instanceKey: string) => {
  const data = persistentHookData.get(instanceKey);
  if (data) {
    delete data.context;
    persistentHookData.set(instanceKey, data);
  }
};

// Restore persistent data to a copilot instance
export const restorePersistentData = (instanceKey: string, copilot: CopilotAPI) => {
  const data = persistentHookData.get(instanceKey);
  if (!data) return;

  // Restore user if exists
  if (data.user) {
    copilot.users?.set(data.user);
  }

  // Restore context if exists
  if (data.context) {
    copilot.context?.set(data.context);
  }

  // Restore tools if exists
  if (data.tools && data.tools.length > 0) {
    data.tools.forEach(tool => {
      copilot.tools?.add(tool);
    });
  }
};