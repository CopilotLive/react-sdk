import { jsx, Fragment } from 'react/jsx-runtime';
import { useEffect, useSyncExternalStore } from 'react';

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
                typeof copilotFn.users?.set === 'function';
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

const subscribers = new Set();
const copilotInstances = new Map();
const subscribeCopilotInstances = (callback) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
};
const notifyCopilotSubscribers = () => {
    for (const cb of subscribers)
        cb();
};

const validateBotName = (botName) => {
    const isValid = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(botName);
    if (!isValid) {
        throw new Error(`[CopilotProvider] Invalid botName "${botName}". It must start with a letter, $, or _, and contain only letters, numbers, $, or _.`);
    }
    return botName;
};

const defaultBotName = 'copilot';

const injectCopilotScript = (key, token, config = {}, scriptUrl, botName = 'copilot') => {
    const safeBotName = validateBotName(botName);
    const scriptId = `copilot-loader-script${safeBotName === 'copilot' ? '' : `-${safeBotName}`}`;
    if (document.getElementById(scriptId))
        return;
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
    });
  `;
    document.body.appendChild(inlineScript);
    waitForCopilot(safeBotName).then((copilot) => {
        if (copilot) {
            copilotInstances.set(key, copilot);
            console.log(`[CopilotProvider] Registered: ${key}`);
            setTimeout(() => {
                notifyCopilotSubscribers();
            }, 0);
        }
    });
};
const CopilotProvider = (props) => {
    useEffect(() => {
        // MULTI mode
        if ('instances' in props && Array.isArray(props.instances)) {
            props.instances.forEach(({ token, config = {}, scriptUrl, botName }, index) => {
                const instanceKey = botName || `${defaultBotName}${index}`;
                injectCopilotScript(instanceKey, token, config, scriptUrl, botName);
            });
        }
        // SINGLE mode
        else if ('token' in props) {
            const { token, config = {}, scriptUrl, botName } = props;
            injectCopilotScript(botName || defaultBotName, token, config, scriptUrl, botName);
        }
    }, [props]);
    return jsx(Fragment, { children: props.children });
};

const Copilot = ({ tools, botName = defaultBotName }) => {
    useEffect(() => {
        const copilot = copilotInstances.get(botName);
        if (!copilot || !tools)
            return;
        if (typeof copilot.tools?.add === 'function') {
            copilot.tools.add(tools);
            const count = Array.isArray(tools) ? tools.length : 1;
            console.log(`[Copilot:${botName}] Registered ${count} tool(s)`);
        }
        else {
            console.warn(`[Copilot:${botName}] tools.add() not available yet`);
        }
    }, [tools || botName]);
    return null;
};

const useCopilot = (idOrIndex) => {
    return useSyncExternalStore(subscribeCopilotInstances, () => {
        const allKeys = Array.from(copilotInstances.keys());
        let key;
        if (idOrIndex === undefined) {
            key = allKeys[0]; // default to first instance
        }
        else if (typeof idOrIndex === 'number') {
            key = allKeys[idOrIndex];
            if (!key) {
                console.error(`[useCopilot] Invalid index: ${idOrIndex}`);
                return undefined;
            }
        }
        else {
            key = idOrIndex;
            if (!copilotInstances.has(key)) {
                console.error(`[useCopilot] Invalid Copilot name: "${key}"`);
                return undefined;
            }
        }
        return copilotInstances.get(key);
    }, () => undefined);
};

const useCopilotTools = (idOrIndex) => {
    const copilot = useCopilot(idOrIndex);
    if (!copilot) {
        console.warn('[useCopilotTools] Copilot instance not found.');
        return undefined;
    }
    return copilot.tools;
};

const useCopilotUser = (idOrIndex) => {
    const copilot = useCopilot(idOrIndex);
    if (!copilot) {
        console.warn('[useCopilotUser] Copilot instance not found.');
        return undefined;
    }
    return copilot.users;
};

export { Copilot, CopilotProvider, useCopilot, useCopilotTools, useCopilotUser };
//# sourceMappingURL=index.esm.js.map
