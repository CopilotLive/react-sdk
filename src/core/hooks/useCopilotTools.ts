import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import type { ToolDefinition } from '../../types/CopilotTypes';

export const useCopilotTool = (
  tool: ToolDefinition,
  options?: { removeOnUnmount?: boolean; idOrIndex?: string | number }
) => {
  const { addTool, removeTool } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    if (!tool?.name) {
      console.warn('[useCopilotTool] Tool must have a valid name');
      return;
    }

    addTool?.(tool);

    return () => {
      if (options?.removeOnUnmount && tool?.name) {
        removeTool?.(tool.name);
      }
    };
    // Dependencies: only care about tool.name and bot index/name
  }, [tool.name, addTool, removeTool]);
};