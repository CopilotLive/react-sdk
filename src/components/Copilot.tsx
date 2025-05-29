import { useEffect } from 'react';
import { useCopilot } from '../core/hooks/useCopilot';
import { type ToolDefinition } from '../types/CopilotTypes';

type Props = {
  tools?: ToolDefinition | ToolDefinition[];
  botName?: string | number; // optional index or string
};

export const Copilot = ({ tools, botName }: Props) => {
  const copilot = useCopilot(botName);

  useEffect(() => {
    if (!copilot || !tools) return;

    if (typeof copilot.tools?.add === 'function') {
      copilot.tools.add(tools);
      const count = Array.isArray(tools) ? tools.length : 1;
      console.log(`[Copilot] Registered ${count} tool(s)`);
    } else {
      console.warn(`[Copilot] tools.add() not available`);
    }
  }, [copilot, tools]);

  return null;
};