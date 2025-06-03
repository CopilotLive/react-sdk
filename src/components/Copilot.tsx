import { useEffect } from 'react';
import { useCopilot } from '../core/hooks/useCopilot';
import { type ToolDefinition } from '../types/CopilotTypes';

type Props = {
  tools?: ToolDefinition | ToolDefinition[];
  botName?: string | number; // string name or index
};

export const Copilot = ({ tools, botName }: Props) => {
  const { addTool, removeAllTools } = useCopilot(botName);

  useEffect(() => {
    if (!tools || !addTool) {
      if (!tools) {
        console.warn('[Copilot] No tools provided.');
      }
      if (!addTool) {
        console.warn(`[Copilot] Copilot instance for "${botName ?? 0}" not ready or missing.`);
      }
      return;
    }

    addTool(tools);
    
    return () => {
      if (typeof removeAllTools === 'function') {
        removeAllTools();
      }
    };
  }, [tools, addTool]);

  return null;
};