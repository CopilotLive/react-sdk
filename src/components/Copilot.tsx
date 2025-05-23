import React, { useEffect } from 'react';
import { copilotInstances } from '../core/CopilotInstanceManager';
import type { ToolDefinition } from '../types/CopilotTypes';

type Props = {
  tools?: ToolDefinition | ToolDefinition[];
  instanceId?: string;
};

export const Copilot = ({ tools, instanceId = 'default' }: Props) => {
  useEffect(() => {
    const copilot = copilotInstances.get(instanceId);

    if (!copilot || !tools) return;

    if (typeof copilot.tools?.add === 'function') {
      copilot.tools.add(tools);
      const count = Array.isArray(tools) ? tools.length : 1;
      console.log(`[Copilot:${instanceId}] Registered ${count} tool(s)`);
    } else {
      console.warn(`[Copilot:${instanceId}] tools.add() not available yet`);
    }
  }, [tools, instanceId]);

  return null;
};