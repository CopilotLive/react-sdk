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
            if (typeof copilotFn && isReady) {
                const copilotAPI = {
                    show: () => copilotFn("event", "open"),
                    hide: () => copilotFn("event", "close"),
                    tools: {
                        add: (tools) => copilotFn.tools?.add?.(tools),
                        remove: (name) => copilotFn.tools?.remove?.(name),
                        removeAll: () => copilotFn.tools?.removeAll?.(),
                    },
                    users: {
                        set: (user) => copilotFn.users?.set?.(user),
                        unset: () => copilotFn.users?.unset?.(),
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

class CopilotInstanceManager {
    instances = new Map();
    set(id, instance) {
        this.instances.set(id, instance);
    }
    get(id) {
        return this.instances.get(id) || null;
    }
    has(id) {
        return this.instances.has(id);
    }
    getAll() {
        return Object.fromEntries(this.instances.entries());
    }
}
const copilotInstances = new CopilotInstanceManager();

exports.CopilotMode = void 0;
(function (CopilotMode) {
    CopilotMode["SINGLE"] = "single";
    CopilotMode["MULTI"] = "multi";
})(exports.CopilotMode || (exports.CopilotMode = {}));

const injectCopilotScript = (mode, token, config = {}, scriptUrl, botName = 'copilot') => {
    const scriptId = `copilot-loader-script${botName === 'copilot' ? '' : `.${botName}`}`;
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
    })(window,document,"script","${botName}");

    ${botName}("init", ${JSON.stringify(config)}, function () {
      window["_${botName}_ready"] = true;
    });
  `;
    waitForCopilot(botName).then((copilot) => {
        if (copilot) {
            copilotInstances.set(mode === exports.CopilotMode.MULTI ? botName : 'default', copilot);
        }
    });
    document.body.appendChild(inlineScript);
};
const CopilotProvider = (props) => {
    const mode = props.mode ?? exports.CopilotMode.SINGLE;
    react.useEffect(() => {
        if (mode === exports.CopilotMode.MULTI && 'instances' in props) {
            props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'Copilot' }) => {
                injectCopilotScript(mode, token, config, scriptUrl, botName);
            });
        }
        else if ('token' in props) {
            injectCopilotScript(mode, props.token, props.config, props.scriptUrl, props.botName);
        }
    }, [props]);
    return jsxRuntime.jsx(jsxRuntime.Fragment, { children: props.children });
};

const Copilot = ({ tools, botName = 'default' }) => {
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

const getCopilotInstance = (instanceId = 'default') => copilotInstances.get(instanceId);

exports.Copilot = Copilot;
exports.CopilotProvider = CopilotProvider;
exports.getCopilotInstance = getCopilotInstance;
//# sourceMappingURL=index.cjs.js.map
