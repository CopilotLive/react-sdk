import { useEffect, useState } from 'react';
import { copilotInstances } from '../CopilotInstanceManager';
import { CopilotAPI, ToolDefinition } from '../../types/CopilotTypes';

const MAX_WAIT_TIME = 5000;

export const useCopilot = (idOrIndex?: string | number) => {
  const [copilot, setCopilot] = useState<CopilotAPI>();
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    const interval = 100;
    const maxTries = MAX_WAIT_TIME / interval;
    let tries = 0;

    const keys = Array.from(copilotInstances.keys());
    let key: string | undefined = 
      idOrIndex === undefined ? keys[0]
      : typeof idOrIndex === 'number' ? keys[idOrIndex]
      : idOrIndex;

    const id = setInterval(() => {
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

  return {
    show: () => copilot?.show(),
    hide: () => copilot?.hide(),
    addTool: (tool: ToolDefinition | ToolDefinition[]) => copilot?.tools?.add(tool),
    removeTool: (name: string) => copilot?.tools?.remove(name),
    removeAllTools: () => copilot?.tools?.removeAll?.(),
    setUser: (user: Record<string, any>) => copilot?.users?.set(user),
    unsetUser: () => copilot?.users?.unset(),
    raw: copilot,
  };
};