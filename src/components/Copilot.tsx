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

    if (copilot && tools && copilot?.tools?.add) {
      copilot.tools.add(tools);
      console.log(`[Copilot:${instanceId}] Registered tool(s)`);
    }
  }, [tools, instanceId]);

  return null;
};