import React, { useEffect } from 'react';
import { copilotInstances } from '../core/CopilotInstanceManager';
import type { ToolDefinition } from '../types/CopilotTypes';

type Props = {
  tools?: ToolDefinition | ToolDefinition[];
  botName?: string;
};

export const Copilot = ({ tools, botName = 'default' }: Props) => {
  useEffect(() => {
    const copilot = copilotInstances.get(botName);
    console.log("Copilot Calls",copilot);
    if (!copilot || !tools) return;

    if (typeof copilot.tools?.add === 'function') {
      copilot.tools.add(tools);
      const count = Array.isArray(tools) ? tools.length : 1;
      console.log(`[Copilot:${botName}] Registered ${count} tool(s)`);
    } else {
      console.warn(`[Copilot:${botName}] tools.add() not available yet`);
    }
  }, [tools, botName]);

  return null;
};