import { useCopilot } from "./useCopilot";

export const useCopilotTools = (instanceId: string = 'copilot1') => {
    const copilot = useCopilot(instanceId);
    return copilot?.tools;
  };