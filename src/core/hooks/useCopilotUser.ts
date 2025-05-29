import { useCopilot } from "./useCopilot";

export const useCopilotUser = (instanceId: string = 'copilot1') => {
    const copilot = useCopilot(instanceId);
    return copilot?.users;
  };