import { useEffect, useState } from 'react';
import { copilotInstances } from '../CopilotInstanceManager';
import type { CopilotAPI, ToolDefinition } from '../../types/CopilotTypes';

const MAX_WAIT_TIME = 5000; // in ms

export const useCopilot = (idOrIndex?: string | number) => {
  const [copilot, setCopilot] = useState<CopilotAPI>();
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    const interval = 100;
    const maxTries = MAX_WAIT_TIME / interval;
    let tries = 0;

    const id = setInterval(() => {
    const keys = Array.from(copilotInstances.keys());
    const key =
      idOrIndex === undefined
        ? keys[0]
        : typeof idOrIndex === 'number'
        ? keys[idOrIndex]
        : idOrIndex;
        
      if (key && copilotInstances.has(key)) {
        setCopilot(copilotInstances.get(key));
        clearInterval(id);
      } else if (++tries >= maxTries) {
        setHasErrored(true);
        clearInterval(id);
      }
    }, interval);

    return () => clearInterval(id);
  }, [idOrIndex]);

  useEffect(() => {
    if (hasErrored) {
      console.error(`[useCopilot] Copilot "${String(idOrIndex ?? '0')}" not found`);
    }
  }, [hasErrored, idOrIndex]);

  const addTool = (toolOrTools: ToolDefinition | ToolDefinition[]) => {
    if (!copilot?.tools?.add) return;

    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    tools.forEach(tool => copilot.tools.add(tool));
  };

  return {
    show: () => copilot?.show(),
    hide: () => copilot?.hide(),
    addTool,
    removeTool: (name: string) => copilot?.tools?.remove(name),
    removeAllTools: () => copilot?.tools?.removeAll?.(),
    setUser: (user: Record<string, any>) => copilot?.users?.set(user),
    unsetUser: () => copilot?.users?.unset(),
    raw: copilot,
  };
};