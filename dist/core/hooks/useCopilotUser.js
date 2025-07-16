import { useEffect } from 'react';
import { useCopilot } from './useCopilot';
import { setPersistentUser, clearPersistentUser } from '../CopilotInstanceManager';
export const useCopilotUser = (user, options) => {
    const { setUser, unsetUser, getInstanceKey } = useCopilot(options?.idOrIndex);
    useEffect(() => {
        const instanceKey = getInstanceKey();
        if (instanceKey) {
            // Persist user data
            setPersistentUser(instanceKey, user);
        }
        setUser?.(user);
        return () => {
            if (options?.unsetOnUnmount && instanceKey) {
                clearPersistentUser(instanceKey);
                unsetUser?.();
            }
        };
    }, [setUser, unsetUser, user, options?.unsetOnUnmount, getInstanceKey]);
};
