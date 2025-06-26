'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

const copilotInstances = new Map();
const persistentHookData = new Map();
// Helper functions to manage persistent data
const setPersistentUser = (instanceKey, user) => {
    const data = persistentHookData.get(instanceKey) || {};
    data.user = user;
    persistentHookData.set(instanceKey, data);
};
const setPersistentContext = (instanceKey, context) => {
    const data = persistentHookData.get(instanceKey) || {};
    data.context = context;
    persistentHookData.set(instanceKey, data);
};
const addPersistentTool = (instanceKey, tool) => {
    const data = persistentHookData.get(instanceKey) || {};
    if (!data.tools)
        data.tools = [];
    // Remove existing tool with same name, then add new one
    data.tools = data.tools.filter(t => t.name !== tool.name);
    data.tools.push(tool);
    persistentHookData.set(instanceKey, data);
};
const removePersistentTool = (instanceKey, toolName) => {
    const data = persistentHookData.get(instanceKey);
    if (data?.tools) {
        data.tools = data.tools.filter(t => t.name !== toolName);
        persistentHookData.set(instanceKey, data);
    }
};
const clearPersistentTools = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        data.tools = [];
        persistentHookData.set(instanceKey, data);
    }
};
const clearPersistentUser = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        delete data.user;
        persistentHookData.set(instanceKey, data);
    }
};
const clearPersistentContext = (instanceKey) => {
    const data = persistentHookData.get(instanceKey);
    if (data) {
        delete data.context;
        persistentHookData.set(instanceKey, data);
    }
};
// Restore persistent data to a copilot instance
const restorePersistentData = (instanceKey, copilot) => {
    const data = persistentHookData.get(instanceKey);
    if (!data)
        return;
    // Restore user if exists
    if (data.user) {
        copilot.users?.set(data.user);
    }
    // Restore context if exists
    if (data.context) {
        copilot.context?.set(data.context);
    }
    // Restore tools if exists
    if (data.tools && data.tools.length > 0) {
        data.tools.forEach(tool => {
            copilot.tools?.add(tool);
        });
    }
};

const MAX_WAIT_TIME = 5000; // in ms
const useCopilot = (idOrIndex) => {
    const [copilot, setCopilot] = react.useState();
    const [hasErrored, setHasErrored] = react.useState(false);
    const [currentInstanceKey, setCurrentInstanceKey] = react.useState('');
    react.useEffect(() => {
        const interval = 100;
        const maxTries = MAX_WAIT_TIME / interval;
        let tries = 0;
        const id = setInterval(() => {
            const keys = Array.from(copilotInstances.keys());
            const key = idOrIndex === undefined
                ? keys[0]
                : typeof idOrIndex === 'number'
                    ? keys[idOrIndex]
                    : idOrIndex;
            if (key && copilotInstances.has(key)) {
                setCopilot(copilotInstances.get(key));
                setCurrentInstanceKey(key);
                clearInterval(id);
            }
            else if (++tries >= maxTries) {
                setHasErrored(true);
                clearInterval(id);
            }
        }, interval);
        return () => clearInterval(id);
    }, [idOrIndex]);
    react.useEffect(() => {
        if (hasErrored) {
            console.error(`[useCopilot] Copilot "${String(idOrIndex ?? '0')}" not found`);
        }
    }, [hasErrored, idOrIndex]);
    const getInstanceKey = react.useCallback(() => {
        return currentInstanceKey;
    }, [currentInstanceKey]);
    const addTool = (toolOrTools) => {
        if (!copilot?.tools?.add)
            return;
        const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
        tools.forEach(tool => {
            copilot.tools.add(tool);
            // Persist tool data
            if (currentInstanceKey) {
                addPersistentTool(currentInstanceKey, tool);
            }
        });
    };
    const setUser = (user) => {
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
    const setContext = (context) => {
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
    const removeTool = (name) => {
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

const CopilotContext = react.createContext(null);
const useCopilotProvider = () => {
    const context = react.useContext(CopilotContext);
    if (!context) {
        throw new Error('useCopilotProvider must be used within CopilotProvider');
    }
    return context;
};
const CopilotProvider = (props) => {
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
    return (jsxRuntime.jsx(CopilotContext.Provider, { value: contextValue, children: props.children }));
};

const defaultBotName = 'copilot';

// Track which instances have tools added via useCopilotTool
const instancesWithHookTools = new Set();
const useCopilotTool = (toolOrTools, options) => {
    const { addTool, removeTool, getInstanceKey } = useCopilot(options?.idOrIndex);
    const registeredToolsRef = react.useRef(new Set());
    react.useEffect(() => {
        const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
        const instanceKey = getInstanceKey();
        // Filter out already registered tools
        const newTools = tools.filter((tool) => {
            const toolKey = `${instanceKey}-${tool.name}`;
            return !registeredToolsRef.current.has(toolKey);
        });
        if (newTools.length === 0) {
            // All tools are already registered, skip
            return;
        }
        if (instanceKey) {
            // Track this instance as having tools from hook
            instancesWithHookTools.add(instanceKey);
            // Persist tools data
            newTools.forEach((tool) => {
                const toolKey = `${instanceKey}-${tool.name}`;
                registeredToolsRef.current.add(toolKey);
                addPersistentTool(instanceKey, tool);
            });
        }
        addTool?.(newTools);
        return () => {
            if (instanceKey) {
                if (options?.clearAllOnUnmount) {
                    // Clear all persistent tools for this instance
                    clearPersistentTools(instanceKey);
                    registeredToolsRef.current.clear();
                    instancesWithHookTools.delete(instanceKey);
                }
                else if (options?.removeOnUnmount) {
                    // Remove only the tools registered in this hook call
                    newTools.forEach((tool) => {
                        if (tool?.name) {
                            const toolKey = `${instanceKey}-${tool.name}`;
                            registeredToolsRef.current.delete(toolKey);
                            removeTool?.(tool.name);
                            removePersistentTool(instanceKey, tool.name);
                        }
                    });
                    // Remove from tracking when unmounting and no tools left
                    if (registeredToolsRef.current.size === 0) {
                        instancesWithHookTools.delete(instanceKey);
                    }
                }
            }
        };
    }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount, options?.clearAllOnUnmount, getInstanceKey]);
};
// Export function to check if instance has tools from hook
const hasHookTools = (idOrIndex) => {
    const instanceKey = typeof idOrIndex === 'string'
        ? idOrIndex
        : typeof idOrIndex === 'number'
            ? `${defaultBotName}${idOrIndex}`
            : defaultBotName;
    return instancesWithHookTools.has(instanceKey);
};

const validateBotName = (botName) => {
    const isValid = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(botName);
    if (!isValid) {
        throw new Error(`[CopilotProvider] Invalid botName "${botName}". It must start with a letter, $, or _, and contain only letters, numbers, $, or _.`);
    }
    return botName;
};

const waitForCopilot = (botName, timeout = 5000, interval = 100) => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined')
            return resolve(null);
        let tries = 0;
        const maxTries = Math.ceil(timeout / interval);
        const scriptId = `copilot-loader-script${botName === 'copilot' ? '' : `-${botName}`}`;
        const cleanup = () => {
            const windowAny = window;
            if (windowAny[`_${botName}_ready`]) {
                windowAny[botName]?.("destroy");
                windowAny[botName] = null;
                windowAny[`_${botName}_ready`] = false;
                copilotInstances.delete(botName);
                const element = document.getElementById(scriptId);
                const elementObjet = document.getElementById(botName);
                if (element) {
                    element.remove();
                    elementObjet?.remove();
                }
            }
        };
        const check = () => {
            const copilotFn = window[botName];
            const isReady = window[`_${botName}_ready`];
            const hasRealAPI = typeof copilotFn === 'function' &&
                typeof copilotFn.tools?.add === 'function' &&
                typeof copilotFn.users?.set === 'function' &&
                typeof copilotFn.context?.set === 'function';
            if (isReady && hasRealAPI) {
                const copilotAPI = {
                    show: () => copilotFn('event', 'open'),
                    hide: () => copilotFn('event', 'close'),
                    tools: {
                        add: (tools) => copilotFn.tools.add(tools),
                        remove: (name) => copilotFn.tools.remove?.(name),
                        removeAll: () => copilotFn.tools.removeAll?.(),
                    },
                    users: {
                        set: (user) => copilotFn.users.set(user),
                        unset: () => copilotFn.users.unset(),
                    },
                    context: {
                        set: (context) => copilotFn.context.set(context),
                        unset: () => copilotFn.context.unset(),
                    },
                    destroy: () => cleanup(),
                };
                return resolve(copilotAPI);
            }
            if (++tries >= maxTries) {
                console.warn(`[${botName}] Copilot not ready after timeout.`);
                return resolve(null);
            }
            setTimeout(check, interval);
        };
        check();
    });
};

const injectCopilotScript = (key, token, config = {}, scriptUrl) => {
    const safeBotName = validateBotName(key);
    const scriptId = `copilot-loader-script${safeBotName === 'copilot' ? '' : `-${safeBotName}`}`;
    //if (document.getElementById(scriptId)) return;
    const inlineScript = document.createElement('script');
    inlineScript.id = scriptId;
    inlineScript.type = 'application/javascript';
    inlineScript.innerHTML = `
    (function(w,d,s,o,f,js,fjs){
      w[o]=w[o]||function(){
        (w[o].q=w[o].q||[]).push(arguments);
      };
      js=d.createElement(s), fjs=d.getElementsByTagName(s)[0];
      js.id=o;
      js.src="${scriptUrl ?? 'https://script.copilot.live/v1/copilot.min.js'}?tkn=${token}";
      js.async=1;
      js.referrerPolicy="origin";
      fjs.parentNode.insertBefore(js,fjs);
    })(window,document,"script","${safeBotName}");

    ${safeBotName}("init", ${JSON.stringify(config)}, function () {
      window["_${safeBotName}_ready"] = true;

      // Telemetry integration
    ${safeBotName}.on("telemetry", function(event) {
      window.dispatchEvent(new CustomEvent("copilot:telemetry", {
        detail: {
          type: event?.type || "telemetry:unknown",
          parameters: event?.parameters || {}
        }
      }));
    });

    });
  `;
    document.head.appendChild(inlineScript);
    waitForCopilot(safeBotName, 5000).then((copilot) => {
        if (copilot) {
            copilotInstances.set(key, copilot);
            // Restore persistent data after the widget is ready
            restorePersistentData(key, copilot);
        }
    });
};
const Copilot = ({ tools, botName }) => {
    const { getInstanceConfig } = useCopilotProvider();
    const { addTool, removeAllTools } = useCopilot(botName);
    const cleanup = (finalKey, scriptId) => {
        const windowAny = window;
        if (windowAny[`_${finalKey}_ready`]) {
            windowAny[finalKey]?.("destroy");
            windowAny[finalKey] = null;
            windowAny[`_${finalKey}_ready`] = false;
            copilotInstances.delete(finalKey);
            const element = document.getElementById(scriptId);
            const elementObjet = document.getElementById(finalKey);
            if (element) {
                element.remove();
                elementObjet?.remove();
            }
        }
    };
    // Handle Copilot instance lifecycle
    react.useEffect(() => {
        const instanceKey = typeof botName === 'string'
            ? botName
            : typeof botName === 'number'
                ? `${defaultBotName}${botName}`
                : defaultBotName;
        const instanceConfig = getInstanceConfig(botName);
        if (!instanceConfig) {
            console.error(`[Copilot] No configuration found for botName: ${botName}`);
            return;
        }
        const { token, config = {}, scriptUrl, botName: configBotName } = instanceConfig;
        const finalKey = configBotName || instanceKey;
        const scriptId = `copilot-loader-script${finalKey === 'copilot' ? '' : `-${finalKey}`}`;
        // Only inject script if instance doesn't exist
        if (!copilotInstances.has(finalKey) && !document.getElementById(scriptId)) {
            injectCopilotScript(finalKey, token, config, scriptUrl);
        }
        // Cleanup function
        return () => {
            if (config?.element) {
                cleanup(finalKey, scriptId);
            }
        };
    }, [botName, getInstanceConfig]);
    // Handle tools management
    react.useEffect(() => {
        if (!tools || !addTool || hasHookTools(botName))
            return;
        addTool(tools);
        return () => {
            if (typeof removeAllTools === 'function') {
                removeAllTools();
            }
        };
    }, [tools, addTool, removeAllTools, botName]);
    return null;
};

const useCopilotUser = (user, options) => {
    const { setUser, unsetUser, getInstanceKey } = useCopilot(options?.idOrIndex);
    react.useEffect(() => {
        const instanceKey = getInstanceKey();
        if (instanceKey) {
            // Persist user data
            setPersistentUser(instanceKey, user);
        }
        setUser?.(user);
        return () => {
            if (options?.unsetOnUnmount && instanceKey) {
                clearPersistentUser(instanceKey);
                unsetUser?.();
            }
        };
    }, [setUser, unsetUser, user, options?.unsetOnUnmount, getInstanceKey]);
};

// TelemetryEvent.ts
var TelemetryEvent;
(function (TelemetryEvent) {
    let Widget;
    (function (Widget) {
        Widget.Load = 'widget:load';
        Widget.Open = 'widget:open';
        Widget.Close = 'widget:close';
        Widget.LauncherClick = 'widget:launcher:click';
    })(Widget = TelemetryEvent.Widget || (TelemetryEvent.Widget = {}));
    let User;
    (function (User) {
        User.Message = 'user:message';
        User.MessageStop = 'user:message:stop';
    })(User = TelemetryEvent.User || (TelemetryEvent.User = {}));
    let Call;
    (function (Call) {
        Call.Connect = 'call:connect';
        Call.Disconnect = 'call:disconnect';
    })(Call = TelemetryEvent.Call || (TelemetryEvent.Call = {}));
    let Assistant;
    (function (Assistant) {
        Assistant.Message = 'assistant:message';
        Assistant.Component = 'assistant:component';
        Assistant.ComponentItemView = 'assistant:component:items:view';
        Assistant.Suggestions = 'assistant:suggestions';
    })(Assistant = TelemetryEvent.Assistant || (TelemetryEvent.Assistant = {}));
    TelemetryEvent.CtaClick = 'cta:click';
    TelemetryEvent.all = {
        ...Widget,
        ...User,
        ...Call,
        ...Assistant,
        CtaClick: TelemetryEvent.CtaClick,
    };
    function from(type, parameters) {
        const knownTypes = Object.values(TelemetryEvent.all);
        if (knownTypes.includes(type)) {
            return {
                name: type,
                parameters,
            };
        }
        return {
            type: 'other',
            name: 'telemetry:other',
            originalType: type,
            parameters,
        };
    }
    TelemetryEvent.from = from;
})(TelemetryEvent || (TelemetryEvent = {}));

class TelemetryBus {
    subject = new rxjs.Subject();
    buffer = [];
    MAX_BUFFER = 100;
    initialized = false;
    emit(event) {
        if (this.buffer.length >= this.MAX_BUFFER) {
            this.buffer.shift(); // Drop oldest
        }
        this.buffer.push(event);
        this.subject.next(event);
    }
    get stream() {
        this.initializeTelemetryBridge();
        return this.subject.asObservable();
    }
    initializeTelemetryBridge() {
        if (this.initialized || typeof window === 'undefined')
            return;
        this.initialized = true;
        window.addEventListener('copilot:telemetry', (e) => {
            const detail = e.detail || {};
            const event = TelemetryEvent.from(detail.type || 'telemetry:unknown', detail.parameters || {});
            this.emit(event);
        });
    }
}
const telemetryBus = new TelemetryBus();

function useTelemetry(groupOrEvent, options) {
    const [events, setEvents] = react.useState([]);
    const throttleMs = options?.throttleDuration ?? 300;
    react.useEffect(() => {
        const sub = telemetryBus.stream
            .pipe(operators.throttleTime(throttleMs), operators.filter(e => {
            if (!groupOrEvent)
                return true;
            if (typeof e.name !== 'string')
                return false;
            return e.name === groupOrEvent || e.name.startsWith(groupOrEvent + ':');
        }))
            .subscribe(event => {
            setEvents(prev => [...prev, event].slice(-100));
        });
        return () => sub.unsubscribe();
    }, [groupOrEvent, throttleMs]);
    return events;
}

const useCopilotContext = (context, options) => {
    const { setContext, unsetContext, getInstanceKey } = useCopilot(options?.idOrIndex);
    react.useEffect(() => {
        const instanceKey = getInstanceKey();
        if (instanceKey) {
            // Persist context data
            setPersistentContext(instanceKey, context);
        }
        setContext?.(context);
        return () => {
            if (options?.unsetOnUnmount && instanceKey) {
                clearPersistentContext(instanceKey);
                unsetContext?.();
            }
        };
    }, [setContext, unsetContext, context, options?.unsetOnUnmount, getInstanceKey]);
};

exports.Copilot = Copilot;
exports.CopilotProvider = CopilotProvider;
exports.hasHookTools = hasHookTools;
exports.telemetryBus = telemetryBus;
exports.useCopilot = useCopilot;
exports.useCopilotContext = useCopilotContext;
exports.useCopilotProvider = useCopilotProvider;
exports.useCopilotTool = useCopilotTool;
exports.useCopilotUser = useCopilotUser;
exports.useTelemetry = useTelemetry;
//# sourceMappingURL=index.cjs.js.map
