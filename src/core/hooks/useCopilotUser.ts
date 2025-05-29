import { useCopilot } from "./useCopilot";

export const useCopilotUser = (idOrIndex?: string | number) => {
  const copilot = useCopilot(idOrIndex);

  if (!copilot) {
    console.warn('[useCopilotUser] Copilot instance not found.');
    return undefined;
  }

  return copilot.users;
};