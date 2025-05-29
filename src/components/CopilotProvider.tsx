// Updated CopilotProvider with automatic mode detection
import React, { useEffect } from 'react';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import { validateBotName } from '../utills/validateBotName';
import { defaultBotName, type CopilotAPI } from '../types/CopilotTypes';

export const registeredCopilotNames: string[] = [];

interface SharedProps {
  children: React.ReactNode;
}

interface SingleInstance {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
}

interface MultiInstance {
  instances: SingleInstance[];
}

type CopilotProviderProps = (SingleInstance | MultiInstance) & SharedProps;

const injectCopilotScript = (
  key: string,
  token: string,
  config: Record<string, any> = {},
  scriptUrl?: string,
  botName: string = 'copilot'
) => {
  const safeBotName = validateBotName(botName);
  const scriptId = `copilot-loader-script${safeBotName === 'copilot' ? '' : `-${safeBotName}`}`;
  if (document.getElementById(scriptId)) return;

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

  waitForCopilot(safeBotName).then((copilot: CopilotAPI | null) => {
    if (copilot) {
      copilotInstances.set(key, copilot);
      registeredCopilotNames.push(key);
      console.log(`[CopilotProvider] Registered: ${key}`);
    }
  });
};

export const CopilotProvider = (props: CopilotProviderProps) => {
  useEffect(() => {
    // MULTI mode
    if ('instances' in props && Array.isArray(props.instances)) {
      props.instances.forEach(({ token, config = {}, scriptUrl, botName }, index) => {
        const instanceKey = botName || `${defaultBotName}${index + 1}`;
        injectCopilotScript(instanceKey, token, config, scriptUrl, botName);
      });
    }
    // SINGLE mode
    else if ('token' in props) {
      const { token, config = {}, scriptUrl, botName } = props;
      injectCopilotScript(botName || defaultBotName, token, config, scriptUrl, botName);
    }
  }, [props]);

  return <>{props.children}</>;
};