// Updated CopilotProvider with automatic mode detection
import React, { createContext, useContext } from 'react';

export interface SingleInstance {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
}

export interface MultiInstance {
  instances: SingleInstance[];
}

interface SharedProps {
  children: React.ReactNode;
}

type CopilotProviderProps = (SingleInstance | MultiInstance) & SharedProps;

type CopilotContextType = {
  getInstanceConfig: (botName?: string | number) => SingleInstance | undefined;
};

const CopilotContext = createContext<CopilotContextType | null>(null);

export const useCopilotProvider = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilotProvider must be used within CopilotProvider');
  }
  return context;
};

export const CopilotProvider = (props: CopilotProviderProps) => {
  const getInstanceConfig = (botName?: string | number): SingleInstance | undefined => {
    // MULTI mode
    if ('instances' in props && Array.isArray(props.instances)) {
      if (typeof botName === 'number') {
        return props.instances[botName];
      }
      if (typeof botName === 'string') {
        return props.instances.find(instance => instance.botName === botName);
      }
      // Default to first instance if no botName specified
      return props.instances[0];
    }
    // SINGLE mode
    else if ('token' in props) {
      const { token, config, scriptUrl, botName: configBotName } = props;
      return {
        token,
        config,
        scriptUrl,
        botName: configBotName
      };
    }
    return undefined;
  };

  const contextValue: CopilotContextType = {
    getInstanceConfig
  };

  return (
    <CopilotContext.Provider value={contextValue}>
      {props.children}
    </CopilotContext.Provider>
  );
};
