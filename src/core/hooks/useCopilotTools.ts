import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import type { ToolDefinition } from '../../types/CopilotTypes';

interface Options {
  removeOnUnmount?: boolean;
  idOrIndex?: string | number;
}

export const useCopilotTool = (
  toolOrTools: ToolDefinition | ToolDefinition[],
  options?: Options
) => {
  const { addTool, removeTool } = useCopilot(options?.idOrIndex);

  useEffect(() => {
    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];

    addTool?.(tools);

    return () => {
      if (options?.removeOnUnmount) {
        tools.forEach(tool => {
          if (tool?.name) removeTool?.(tool.name);
        });
      }
    };
  }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount]);
};