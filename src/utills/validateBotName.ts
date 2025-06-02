export const validateBotName = (botName: string): string => {
    const isValid = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(botName);
    if (!isValid) {
      throw new Error(
        `[CopilotProvider] Invalid botName "${botName}". It must start with a letter, $, or _, and contain only letters, numbers, $, or _.`
      );
    }
    return botName;
  };