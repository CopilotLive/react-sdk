'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

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

const copilotInstances = new Map();

const validateBotName = (botName) => {
    const isValid = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(botName);
    if (!isValid) {
        throw new Error(`[CopilotProvider] Invalid botName "${botName}". It must start with a letter, $, or _, and contain only letters, numbers, $, or _.`);
    }
    return botName;
};

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
        }
    });
};
const CopilotProvider = (props) => {
    react.useEffect(() => {
        // MULTI mode
        if ('instances' in props && Array.isArray(props.instances)) {
            props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'copilot' }, index) => {
                const instanceKey = `${botName}${index + 1}`;
                injectCopilotScript(instanceKey, token, config, scriptUrl, botName);
            });
        }
        // SINGLE mode
        else if ('token' in props) {
            const { token, config = {}, scriptUrl, botName = 'copilot' } = props;
            injectCopilotScript('default', token, config, scriptUrl, botName);
        }
    }, [props]);
    return jsxRuntime.jsx(jsxRuntime.Fragment, { children: props.children });
};

const Copilot = ({ tools, botName = 'copilot1' }) => {
    react.useEffect(() => {
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

const useCopilot = (instanceId = 'copilot1') => {
    return react.useMemo(() => {
        const copilot = copilotInstances.get(instanceId);
        if (!copilot) {
            console.warn(`[useCopilot] Copilot instance "${instanceId}" not found.`);
            return undefined;
        }
        return copilot;
    }, [instanceId]);
};

const useCopilotTools = (instanceId = 'copilot1') => {
    const copilot = useCopilot(instanceId);
    return copilot?.tools;
};

const useCopilotUser = (instanceId = 'copilot1') => {
    const copilot = useCopilot(instanceId);
    return copilot?.users;
};

exports.Copilot = Copilot;
exports.CopilotProvider = CopilotProvider;
exports.useCopilot = useCopilot;
exports.useCopilotTools = useCopilotTools;
exports.useCopilotUser = useCopilotUser;
//# sourceMappingURL=index.cjs.js.map
