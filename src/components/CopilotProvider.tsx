import React, { useEffect } from 'react';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import { CopilotMode } from '../types/CopilotTypes';
import { validateBotName } from '../utills/validateBotName';

type SharedProps = {
  mode?: CopilotMode;
  children: React.ReactNode;
};

type SingleInstanceProps = {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
} & SharedProps & { mode?: CopilotMode.SINGLE };

type MultiInstanceProps = {
  instances: {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
  }[];
} & SharedProps & { mode: CopilotMode.MULTI };

type Props = SingleInstanceProps | MultiInstanceProps;

const injectCopilotScript = (
  mode: CopilotMode,
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

  waitForCopilot(safeBotName).then((copilot) => {
    if (copilot) {
      copilotInstances.set(mode === CopilotMode.MULTI ? safeBotName : 'default', copilot);
    }
  });
};

export const CopilotProvider = (props: Props) => {
  const mode = props.mode ?? CopilotMode.SINGLE;

  useEffect(() => {
    if (mode === CopilotMode.MULTI && 'instances' in props) {
      props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'copilot' }) => {
        injectCopilotScript(mode, token, config, scriptUrl, botName);
      });
    } else if ('token' in props) {
      injectCopilotScript(mode, props.token, props.config, props.scriptUrl, props.botName);
    }
  }, [props]);

  return <>{props.children}</>;
};
