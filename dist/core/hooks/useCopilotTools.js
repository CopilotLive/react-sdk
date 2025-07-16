import { useEffect, useRef } from 'react';
import { useCopilot } from './useCopilot';
import { defaultBotName } from '../../types/CopilotTypes';
import { addPersistentTool, addPersistentTools, removePersistentTool, clearPersistentTools } from '../CopilotInstanceManager';
// Track which instances have tools added via useCopilotTool
const instancesWithHookTools = new Set();
export const useCopilotTool = (toolOrTools, options) => {
    const { addTool, removeTool, getInstanceKey } = useCopilot(options?.idOrIndex);
    const registeredToolsRef = useRef(new Set());
    useEffect(() => {
        const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
        const instanceKey = getInstanceKey();
        // Filter out already registered tools
        const newTools = tools.filter((tool) => {
            const toolKey = `${instanceKey}-${tool.name}`;
            return !registeredToolsRef.current.has(toolKey);
        });
        if (newTools.length === 0) {
            // All tools are already registered, skip
            return;
        }
        if (instanceKey) {
            // Track this instance as having tools from hook
            instancesWithHookTools.add(instanceKey);
            // Track registered tools efficiently (batch operation)
            newTools.forEach((tool) => {
                const toolKey = `${instanceKey}-${tool.name}`;
                registeredToolsRef.current.add(toolKey);
            });
            // Use batch persistence for optimal performance
            if (newTools.length === 1) {
                addPersistentTool(instanceKey, newTools[0]);
            }
            else {
                addPersistentTools(instanceKey, newTools);
            }
        }
        addTool?.(newTools);
        return () => {
            if (instanceKey) {
                if (options?.clearAllOnUnmount) {
                    // Clear all persistent tools for this instance
                    clearPersistentTools(instanceKey);
                    registeredToolsRef.current.clear();
                    instancesWithHookTools.delete(instanceKey);
                }
                else if (options?.removeOnUnmount) {
                    // Remove only the tools registered in this hook call (batch operation)
                    const toolKeysToRemove = newTools.map(tool => `${instanceKey}-${tool.name}`);
                    const toolNamesToRemove = newTools.map(tool => tool.name);
                    // Batch remove from tracking
                    toolKeysToRemove.forEach(toolKey => registeredToolsRef.current.delete(toolKey));
                    // Batch remove from API (note: removeTool still needs individual calls as the API doesn't support batch removal)
                    toolNamesToRemove.forEach(toolName => {
                        if (toolName) {
                            removeTool?.(toolName);
                            removePersistentTool(instanceKey, toolName);
                        }
                    });
                    // Remove from tracking when unmounting and no tools left
                    if (registeredToolsRef.current.size === 0) {
                        instancesWithHookTools.delete(instanceKey);
                    }
                }
            }
        };
    }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount, options?.clearAllOnUnmount, getInstanceKey]);
};
// Export function to check if instance has tools from hook
export const hasHookTools = (idOrIndex) => {
    const instanceKey = typeof idOrIndex === 'string'
        ? idOrIndex
        : typeof idOrIndex === 'number'
            ? `${defaultBotName}${idOrIndex}`
            : defaultBotName;
    return instancesWithHookTools.has(instanceKey);
};
