import { useState, useEffect, useCallback } from 'react';
import { copilotInstances, setPersistentUser, setPersistentContext, addPersistentTool, clearPersistentUser, clearPersistentContext, removePersistentTool } from '../CopilotInstanceManager';
import type { CopilotAPI, ToolDefinition } from '../../types/CopilotTypes';
import { defaultBotName } from '../../types/CopilotTypes';

const MAX_WAIT_TIME = 5000; // in ms

export const useCopilot = (idOrIndex?: string | number) => {
  const [copilot, setCopilot] = useState<CopilotAPI>();
  const [hasErrored, setHasErrored] = useState(false);
  const [currentInstanceKey, setCurrentInstanceKey] = useState<string>('');

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
        setCurrentInstanceKey(key);
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

  const getInstanceKey = useCallback(() => {
    return currentInstanceKey;
  }, [currentInstanceKey]);

  const addTool = (toolOrTools: ToolDefinition | ToolDefinition[]) => {
    if (!copilot?.tools?.add) return;

    const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
    tools.forEach(tool => {
      copilot.tools.add(tool);
      // Persist tool data
      if (currentInstanceKey) {
        addPersistentTool(currentInstanceKey, tool);
      }
    });
  };

  const setUser = (user: Record<string, any>) => {
    copilot?.users?.set(user);
    // Persist user data
    if (currentInstanceKey) {
      setPersistentUser(currentInstanceKey, user);
    }
  };

  const unsetUser = () => {
    copilot?.users?.unset();
    // Clear persistent user data
    if (currentInstanceKey) {
      clearPersistentUser(currentInstanceKey);
    }
  };

  const setContext = (context: Record<string, any>) => {
    copilot?.context?.set(context);
    // Persist context data
    if (currentInstanceKey) {
      setPersistentContext(currentInstanceKey, context);
    }
  };

  const unsetContext = () => {
    copilot?.context?.unset();
    // Clear persistent context data
    if (currentInstanceKey) {
      clearPersistentContext(currentInstanceKey);
    }
  };

  const removeTool = (name: string) => {
    copilot?.tools?.remove(name);
    // Remove from persistent data
    if (currentInstanceKey) {
      removePersistentTool(currentInstanceKey, name);
    }
  };

  return {
    show: () => copilot?.show(),
    hide: () => copilot?.hide(),
    destroy: () => copilot?.destroy(),
    addTool,
    removeTool,
    removeAllTools: () => copilot?.tools?.removeAll?.(),
    setUser,
    unsetUser,
    setContext,
    unsetContext,
    getInstanceKey,
    raw: copilot,
  };
};