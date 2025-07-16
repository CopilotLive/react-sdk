export const waitForCopilot = (botName, timeout = 5000) => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined')
            return resolve(null);
        let tries = 0;
        const maxTries = Math.ceil(timeout / 100);
        const scriptId = `copilot-loader-script${botName === 'copilot' ? '' : `-${botName}`}`;
        const cleanup = () => {
            const scriptElement = document.getElementById(scriptId);
            const botElement = document.getElementById(botName);
            if (scriptElement)
                scriptElement.remove();
            if (botElement)
                botElement.remove();
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
                        add: (tools) => {
                            console.log('add', tools);
                            copilotFn.tools.add(tools);
                        },
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
            setTimeout(check, 100);
        };
        check();
    });
};
