const lastCallTimes: Map<string, number> = new Map();

const didSomeTimePass = (key: string = "default", time: number = 1000): boolean => {
    const now = Date.now();
    const lastCallTime = lastCallTimes.get(key) || 0;

    if (now - lastCallTime < time) {
        return false; // Less than 1 second has passed
    }

    lastCallTimes.set(key, now); // Update the last call time for this key
    return true; // 1 second has passed
};

export { didSomeTimePass };