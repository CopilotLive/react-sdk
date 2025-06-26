import { useEffect, useRef } from 'react';
import { useCopilot } from './useCopilot';
import type { ToolDefinition } from '../../types/CopilotTypes';
import { defaultBotName } from '../../types/CopilotTypes';
import { addPersistentTool, removePersistentTool, clearPersistentTools } from '../CopilotInstanceManager';

interface Options {
  removeOnUnmount?: boolean;
  idOrIndex?: string | number;
  clearAllOnUnmount?: boolean;
}

// Track which instances have tools added via useCopilotTool
const instancesWithHookTools = new Set<string>();

export const useCopilotTool = (
  toolOrTools: ToolDefinition | ToolDefinition[],
  options?: Options
) => {
  const { addTool, removeTool, getInstanceKey } = useCopilot(options?.idOrIndex);
  const registeredToolsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    const instanceKey = getInstanceKey();
    
    // Filter out already registered tools
    const newTools = tools.filter((tool: ToolDefinition) => {
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
      
      // Persist tools data
      newTools.forEach((tool: ToolDefinition) => {
        const toolKey = `${instanceKey}-${tool.name}`;
        registeredToolsRef.current.add(toolKey);
        addPersistentTool(instanceKey, tool);
      });
    }

    addTool?.(newTools);

    return () => {
      if (instanceKey) {
        if (options?.clearAllOnUnmount) {
          // Clear all persistent tools for this instance
          clearPersistentTools(instanceKey);
          registeredToolsRef.current.clear();
          instancesWithHookTools.delete(instanceKey);
        } else if (options?.removeOnUnmount) {
          // Remove only the tools registered in this hook call
          newTools.forEach((tool: ToolDefinition) => {
            if (tool?.name) {
              const toolKey = `${instanceKey}-${tool.name}`;
              registeredToolsRef.current.delete(toolKey);
              removeTool?.(tool.name);
              removePersistentTool(instanceKey, tool.name);
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
export const hasHookTools = (idOrIndex?: string | number): boolean => {
  const instanceKey = typeof idOrIndex === 'string' 
    ? idOrIndex 
    : typeof idOrIndex === 'number'
      ? `${defaultBotName}${idOrIndex}`
      : defaultBotName;
  return instancesWithHookTools.has(instanceKey);
};