import React, { useEffect } from 'react';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import { CopilotMode } from '../types/CopilotTypes';

type SharedProps = {
  mode?: CopilotMode;
  children: React.ReactNode;
};

// SINGLE MODE
type SingleInstanceProps = {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
  botName?: string;
} & SharedProps & { mode?: CopilotMode.SINGLE };

// MULTI MODE
type MultiInstanceProps = {
  instances: {
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
    botName?: string;
  }[];
} & SharedProps & { mode: CopilotMode.MULTI };

type Props = SingleInstanceProps | MultiInstanceProps;

export const CopilotProvider = (props: Props) => {
  const mode = props.mode ?? CopilotMode.SINGLE;

  useEffect(() => {
    if (mode === CopilotMode.MULTI && 'instances' in props) {
      props.instances.forEach(({ token, config = {}, scriptUrl, botName = 'Copilot' }) => {
        const scriptId = `copilot-loader-script-${botName}`;
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
          })(window,document,"script","${botName?? 'copilot'}");
    
          ${botName?? 'copilot'}("init", ${JSON.stringify(config)});
        `;

        waitForCopilot(botName).then((copilot) => {
          if (copilot) {
            copilotInstances.set(botName, copilot);
            console.log(`[${botName}:${botName}] registered`);
          }
        });
      });
    } else if ('token' in props) {
      const scriptId = `copilot-loader-script`;
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
          js.src="${props.scriptUrl ?? 'https://script.copilot.live/v1/copilot.min.js'}?tkn=${props.token}";
          js.async=1;
          js.referrerPolicy="origin";
          fjs.parentNode.insertBefore(js,fjs);
        })(window,document,"script","${props.botName?? 'copilot'}");
  
        ${props.botName?? 'copilot'}("init", ${JSON.stringify(props.config)});
      `;

      document.body.appendChild(inlineScript);

      const botName = props.botName ?? 'copilot';

      waitForCopilot(botName).then((copilot) => {
        if (copilot) {
          copilotInstances.set('default', copilot);
          console.log(`[${botName}:default] registered`);
        }
      });
    }
  }, [props]);

  return <>{props.children}</>;
};