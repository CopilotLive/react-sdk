import { useCopilot } from "./useCopilot";

export const useCopilotTools = (idOrIndex?: string | number) => {
  const copilot = useCopilot(idOrIndex);

  if (!copilot) {
    console.warn('[useCopilotTools] Copilot instance not found.');
    return undefined;
  }

  return copilot.tools;
};