import { jsx as _jsx } from "react/jsx-runtime";
// Updated CopilotProvider with automatic mode detection
import { createContext, useContext } from 'react';
const CopilotContext = createContext(null);
export const useCopilotProvider = () => {
    const context = useContext(CopilotContext);
    if (!context) {
        throw new Error('useCopilotProvider must be used within CopilotProvider');
    }
    return context;
};
export const CopilotProvider = (props) => {
    const getInstanceConfig = (botName) => {
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
    const contextValue = {
        getInstanceConfig
    };
    return (_jsx(CopilotContext.Provider, { value: contextValue, children: props.children }));
};
