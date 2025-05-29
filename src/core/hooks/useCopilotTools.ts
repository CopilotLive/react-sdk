import { defaultBotName } from "../../types/CopilotTypes";
import { useCopilot } from "./useCopilot";

export const useCopilotTools = (instanceId: string = defaultBotName) => {
    const copilot = useCopilot(instanceId);
    return copilot?.tools;
  };