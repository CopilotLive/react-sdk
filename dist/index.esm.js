import { jsx, Fragment } from 'react/jsx-runtime';
import { useEffect, useMemo } from 'react';

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

var CopilotMode;
(function (CopilotMode) {
    CopilotMode["SINGLE"] = "single";
    CopilotMode["MULTI"] = "multi";
})(CopilotMode || (CopilotMode = {}));

const validateBotName = (botName) => {
    const isValid = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(botName);
    if (!isValid) {
        throw new Error(`[CopilotProvider] Invalid botName "${botName}". It must start with a letter, $, or _, and contain only letters, numbers, $, or _.`);
    }
    return botName;
};

const injectCopilotScript = (mode, token, config = {}, scriptUrl, botName = 'copilot') => {
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
            copilotInstances.set(mode === CopilotMode.MULTI ? safeBotName : 'copilot1', copilot);
        }
    });
};
const CopilotProvider = (props) => {
    const mode = props.mode ?? CopilotMode.SINGLE;
    useEffect(() => {
        if (mode === CopilotMode.MULTI && 'instances' in props) {
            props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'copilot' }, index) => {
                injectCopilotScript(mode, token, config, scriptUrl, `${botName}${index + 1}`);
            });
        }
        else if ('token' in props) {
            injectCopilotScript(mode, props.token, props.config, props.scriptUrl, props.botName);
        }
    }, [props]);
    return jsx(Fragment, { children: props.children });
};

const Copilot = ({ tools, botName = 'copilot1' }) => {
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

const useCopilot = (instanceId = 'copilot1') => {
    return useMemo(() => {
        const copilot = copilotInstances.get(instanceId);
        if (!copilot) {
            console.warn(`[useCopilot] Copilot instance "${instanceId}" not found.`);
            return undefined;
        }
        return copilot;
    }, [instanceId]);
};

export { Copilot, CopilotMode, CopilotProvider, useCopilot };
//# sourceMappingURL=index.esm.js.map
