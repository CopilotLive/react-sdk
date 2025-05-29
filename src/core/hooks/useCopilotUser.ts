import { defaultBotName } from "../../types/CopilotTypes";
import { useCopilot } from "./useCopilot";

export const useCopilotUser = (idOrIndex: string | number = defaultBotName) => {
  const copilot = useCopilot(idOrIndex);
  return copilot?.users;
};