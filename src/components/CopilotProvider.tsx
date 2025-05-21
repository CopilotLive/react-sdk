import React, { useEffect } from 'react';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import type { CopilotAPI } from '../types/CopilotTypes';
import { CopilotMode } from '../types/CopilotTypes';

// Base
type SharedProps = {
  mode?: CopilotMode;
  children: React.ReactNode;
};

// SINGLE MODE
type SingleInstanceProps = {
  token: string;
  config?: Record<string, any>;
  scriptUrl?: string;
} & SharedProps & { mode?: CopilotMode.SINGLE };

// MULTI MODE
type MultiInstanceProps = {
  instances: {
    instanceId: string;
    token: string;
    config?: Record<string, any>;
    scriptUrl?: string;
  }[];
} & SharedProps & { mode: CopilotMode.MULTI };

type Props = SingleInstanceProps | MultiInstanceProps;

export const CopilotProvider = (props: Props) => {
  const mode = props.mode ?? CopilotMode.SINGLE;

  useEffect(() => {
    if (mode === CopilotMode.MULTI && 'instances' in props) {
      props.instances.forEach(({ instanceId, token, config = {}, scriptUrl }) => {
        const scriptId = `copilot-widget-${instanceId}`;
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `${scriptUrl ?? 'https://script.copilot.live/v1/copilot.min.js'}?tkn=${token}`;
        script.async = true;
        script.referrerPolicy = 'origin';
        document.body.appendChild(script);

        waitForCopilot().then((copilot) => {
          if (copilot?.init) {
            copilot.init(config);
            copilotInstances.set(instanceId, copilot);
            console.log(`[Copilot:${instanceId}] initialized`);
          }
        });
      });
    } else if ('token' in props) {
      const scriptId = `copilot-widget-default`;
      if (document.getElementById(scriptId)) return;

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `${props.scriptUrl ?? 'https://script.copilot.live/v1/copilot.min.js'}?tkn=${props.token}`;
      script.async = true;
      script.referrerPolicy = 'origin';
      document.body.appendChild(script);

      waitForCopilot().then((copilot) => {
        if (copilot?.init) {
          copilot.init(props.config ?? {});
          copilotInstances.set('default', copilot);
          console.log(`[Copilot:default] initialized`);
        }
      });
    }
  }, [JSON.stringify(props)]);

  return <>{props.children}</>;
};