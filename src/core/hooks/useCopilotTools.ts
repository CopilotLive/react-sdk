import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import type { ToolDefinition } from '../../types/CopilotTypes';
import { defaultBotName } from '../../types/CopilotTypes';

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
  const { addTool, removeTool } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    
    // Track this instance as having tools from hook
    const instanceKey = options?.idOrIndex?.toString() || defaultBotName;
    instancesWithHookTools.add(instanceKey);

    addTool?.(tools);

    return () => {
      if (options?.removeOnUnmount) {
        tools.forEach(tool => {
          if (tool?.name) removeTool?.(tool.name);
        });
        // Remove from tracking when unmounting
        instancesWithHookTools.delete(instanceKey);
      }
    };
  }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount, options?.idOrIndex]);
};

// Export function to check if instance has tools from hook
export const hasHookTools = (idOrIndex?: string | number): boolean => {
  const instanceKey = idOrIndex?.toString() || defaultBotName;
  return instancesWithHookTools.has(instanceKey);
};