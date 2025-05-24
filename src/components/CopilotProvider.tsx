import React, { useEffect } from 'react';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import { CopilotMode } from '../types/CopilotTypes';
import { SafeBotName } from '../types/SafeBotName';

type SharedProps = {
  mode?: CopilotMode;
  children: React.ReactNode;
};

// SINGLE MODE
type SingleInstanceProps = {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: SafeBotName<string>;
} & SharedProps & { mode?: CopilotMode.SINGLE };

// MULTI MODE
type MultiInstanceProps = {
  instances: {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: SafeBotName<string>;
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
  const scriptId = `copilot-loader-script${botName === 'copilot' ? '' : `.${botName}`}`;
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
    })(window,document,"script","${botName}");

    ${botName}("init", ${JSON.stringify(config)}, function () {
      window["_${botName}_ready"] = true;
    });
  `;

  waitForCopilot(botName).then((copilot) => {
    if (copilot) {
      copilotInstances.set(mode === CopilotMode.MULTI ? botName : 'default', copilot);
    }
  });

  document.body.appendChild(inlineScript);
};

export const CopilotProvider = (props: Props) => {
  const mode = props.mode ?? CopilotMode.SINGLE;

  useEffect(() => {
    if (mode === CopilotMode.MULTI && 'instances' in props) {
      props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'Copilot' }) => {
        injectCopilotScript(mode,token, config, scriptUrl, botName);
      });
    } else if ('token' in props) {
      injectCopilotScript(mode,props.token, props.config, props.scriptUrl, props.botName);
    }
  }, [props]);

  return <>{props.children}</>;
};