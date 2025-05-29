import { defaultBotName } from "../../types/CopilotTypes";
import { useCopilot } from "./useCopilot";

export const useCopilotUser = (instanceId: string = defaultBotName) => {
    const copilot = useCopilot(instanceId);
    return copilot?.users;
  };