import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import type { ToolDefinition } from '../../types/CopilotTypes';
import { defaultBotName } from '../../types/CopilotTypes';
import { addPersistentTool, removePersistentTool, clearPersistentTools } from '../CopilotInstanceManager';

interface Options {
  removeOnUnmount?: boolean;
  idOrIndex?: string | number;
}

// Track which instances have tools added via useCopilotTool
const instancesWithHookTools = new Set<string>();

export const useCopilotTool = (
  toolOrTools: ToolDefinition | ToolDefinition[],
  options?: Options
) => {
  const { addTool, removeTool, getInstanceKey } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    const instanceKey = getInstanceKey();
    
    if (instanceKey) {
      // Track this instance as having tools from hook
      instancesWithHookTools.add(instanceKey);
      
      // Persist tools data
      tools.forEach(tool => {
        addPersistentTool(instanceKey, tool);
      });
    }

    addTool?.(tools);

    return () => {
      if (options?.removeOnUnmount && instanceKey) {
        tools.forEach(tool => {
          if (tool?.name) {
            removeTool?.(tool.name);
            removePersistentTool(instanceKey, tool.name);
          }
        });
        // Remove from tracking when unmounting and no tools left
        const hasRemainingTools = tools.length === 0;
        if (hasRemainingTools) {
          instancesWithHookTools.delete(instanceKey);
        }
      }
    };
  }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount, getInstanceKey]);
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