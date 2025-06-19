'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var rxjs = require('rxjs');
var operators = require('rxjs/operators');

const copilotInstances = new Map();

const MAX_WAIT_TIME = 5000; // in ms
const useCopilot = (idOrIndex) => {
    const [copilot, setCopilot] = react.useState();
    const [hasErrored, setHasErrored] = react.useState(false);
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
    const addTool = (toolOrTools) => {
        if (!copilot?.tools?.add)
            return;
        const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
        tools.forEach(tool => copilot.tools.add(tool));
    };
    return {
        show: () => copilot?.show(),
        hide: () => copilot?.hide(),
        destroy: () => copilot?.destroy(),
        addTool,
        removeTool: (name) => copilot?.tools?.remove(name),
        removeAllTools: () => copilot?.tools?.removeAll?.(),
        setUser: (user) => copilot?.users?.set(user),
        unsetUser: () => copilot?.users?.unset(),
        setContext: (context) => copilot?.context?.set(context),
        unsetContext: () => copilot?.context?.unset(),
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
    const { addTool, removeTool } = useCopilot(options?.idOrIndex);
    react.useEffect(() => {
        const tools = Array.isArray(toolOrTools) ? toolOrTools : [toolOrTools];
        // Track this instance as having tools from hook
        const instanceKey = options?.idOrIndex?.toString() || defaultBotName;
        instancesWithHookTools.add(instanceKey);
        addTool?.(tools);
        return () => {
            if (options?.removeOnUnmount) {
                tools.forEach(tool => {
                    if (tool?.name)
                        removeTool?.(tool.name);
                });
                // Remove from tracking when unmounting
                instancesWithHookTools.delete(instanceKey);
            }
        };
    }, [addTool, removeTool, toolOrTools, options?.removeOnUnmount, options?.idOrIndex]);
};
// Export function to check if instance has tools from hook
const hasHookTools = (idOrIndex) => {
    const instanceKey = idOrIndex?.toString() || defaultBotName;
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
                    destroy: () => copilotFn('destroy')
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
    waitForCopilot(safeBotName).then((copilot) => {
        if (copilot) {
            copilotInstances.set(key, copilot);
        }
    });
};
const Copilot = ({ tools, botName }) => {
    const { getInstanceConfig } = useCopilotProvider();
    const { addTool, removeAllTools } = useCopilot(botName);
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
    const { setUser, unsetUser } = useCopilot(options?.idOrIndex);
    react.useEffect(() => {
        setUser?.(user);
        return () => {
            if (options?.unsetOnUnmount) {
                unsetUser?.();
            }
        };
    }, [setUser, unsetUser, user, options?.unsetOnUnmount]);
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
    const { setContext, unsetContext } = useCopilot(options?.idOrIndex);
    react.useEffect(() => {
        setContext?.(context);
        return () => {
            if (options?.unsetOnUnmount) {
                unsetContext?.();
            }
        };
    }, [setContext, unsetContext, context, options?.unsetOnUnmount]);
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
