import { defaultBotName } from "../../types/CopilotTypes";
import { useCopilot } from "./useCopilot";

export const useCopilotTools = (idOrIndex: string | number = defaultBotName) => {
  const copilot = useCopilot(idOrIndex);
  return copilot?.tools;
};