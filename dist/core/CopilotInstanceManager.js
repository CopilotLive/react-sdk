export const copilotInstances = new Map();
export const persistentHookData = new Map();
// Helper functions to manage persistent data
export const setPersistentUser = (instanceKey, user) => {
    const data = persistentHookData.get(instanceKey) || {};
    data.user = user;
    persistentHookData.set(instanceKey, data);
};
export const setPersistentContext = (instanceKey, context) => {
    const data = persistentHookData.get(instanceKey) || {};
    data.context = context;
    persistentHookData.set(instanceKey, data);
};
export const addPersistentTool = (instanceKey, tool) => {
    const data = persistentHookData.get(instanceKey) || {};
    if (!data.tools)
        data.tools = [];
    // Remove existing tool with same name, then add new one
    data.tools = data.tools.filter(t => t.name !== tool.name);
    data.tools.push(tool);
    persistentHookData.set(instanceKey, data);
};
// Batch version for adding multiple tools efficiently
export const addPersistentTools = (instanceKey, tools) => {
    const data = persistentHookData.get(instanceKey) || {};
    if (!data.tools)
        data.tools = [];
    // Extract tool names for efficient filtering
    const newToolNames = new Set(tools.map(tool => tool.name));
    // Remove existing tools with same names in one operation
    data.tools = data.tools.filter(t => !newToolNames.has(t.name));
    // Add all new tools at once
    data.tools.push(...tools);
    persistentHookData.set(instanceKey, data);
};
export const removePersistentTool = (instanceKey, toolName) => {
    const data = persistentHookData.get(instanceKey);
    if (data?.tools) {
        data.tools = data.tools.filter(t => t.name !== toolName);
        persistentHookData.set(instanceKey, data);
    }
};
export const clearPersistentTools = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        data.tools = [];
        persistentHookData.set(instanceKey, data);
    }
};
export const getPersistentData = (instanceKey) => {
    return persistentHookData.get(instanceKey);
};
export const clearPersistentUser = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        delete data.user;
        persistentHookData.set(instanceKey, data);
    }
};
export const clearPersistentContext = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        delete data.context;
        persistentHookData.set(instanceKey, data);
    }
};
// Restore persistent data to a copilot instance
export const restorePersistentData = (instanceKey, copilot) => {
    const data = persistentHookData.get(instanceKey);
    if (!data)
        return;
    // Restore user if exists
    if (data.user) {
        copilot.users?.set(data.user);
    }
    // Restore context if exists
    if (data.context) {
        copilot.context?.set(data.context);
    }
    // Restore all tools at once (batch operation)
    if (data.tools && data.tools.length > 0) {
        copilot.tools?.add(data.tools);
    }
};
