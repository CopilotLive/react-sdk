import { useEffect } from 'react';
import { useCopilot } from '../core/hooks/useCopilot';
import { useCopilotProvider } from './CopilotProvider';
import { hasHookTools } from '../core/hooks/useCopilotTools';
import { validateBotName } from '../utills/validateBotName';
import { waitForCopilot } from '../core/waitForCopilot';
import { copilotInstances } from '../core/CopilotInstanceManager';
import { defaultBotName, type ToolDefinition, type CopilotAPI } from '../types/CopilotTypes';

type Props = {
  tools?: ToolDefinition | ToolDefinition[];
  botName?: string | number; // string name or index
};

const injectCopilotScript = (
  key: string,
  token: string,
  config: Record<string, any> = {},
  scriptUrl?: string,
) => {
  const safeBotName = validateBotName(key);
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

      // Telemetry integration
    ${safeBotName}.on("telemetry", function(event) {
      window.dispatchEvent(new CustomEvent("copilot:telemetry", {
        detail: {
          type: event?.type || "telemetry:unknown",
          parameters: event?.parameters || {}
        }
      }));
    });

    });
  `;

  document.body.appendChild(inlineScript);

  waitForCopilot(safeBotName).then((copilot: CopilotAPI | null) => {
    if (copilot) {
      copilotInstances.set(key, copilot);
    }
  });
};

export const Copilot = ({ tools, botName }: Props) => {
  const { getInstanceConfig } = useCopilotProvider();
  const { addTool, removeAllTools } = useCopilot(botName);

  useEffect(() => {
    const instanceKey =
      typeof botName === 'string'
        ? botName
        : typeof botName === 'number'
        ? `${defaultBotName}${botName}`
        : defaultBotName;

    // 🚨 One-time hard reload logic
    const reloadKey = `copilot_hard_reloaded_${instanceKey}`;
    const hasReloaded = sessionStorage.getItem(reloadKey);

    if (!hasReloaded) {
      sessionStorage.setItem(reloadKey, 'true');
      window.location.reload();
      return;
    }

    const instanceConfig = getInstanceConfig(botName);
    if (!instanceConfig) {
      console.error(`[Copilot] No configuration found for botName: ${botName}`);
      return;
    }

    const { token, config = {}, scriptUrl, botName: configBotName } = instanceConfig;
    const finalKey = configBotName || instanceKey;

    injectCopilotScript(finalKey, token, config, scriptUrl);

    return () => {
      sessionStorage.setItem(reloadKey, 'false');
    }

  }, [botName, getInstanceConfig]);

  useEffect(() => {
    if (!tools || !addTool) return;
    if (hasHookTools(botName)) return;

    addTool(tools);

    return () => {
      if (typeof removeAllTools === 'function') {
        removeAllTools();
      }
    };
  }, [tools, addTool, removeAllTools, botName]);

  return null;
};