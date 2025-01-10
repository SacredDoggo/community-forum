const requestTimestamps: Map<string, number> = new Map();

export const timeCheckFunction = (key: string, delay: number = 1000): boolean => {
  const now = Date.now();
  const lastRequestTime = requestTimestamps.get(key);

  if (lastRequestTime && now - lastRequestTime < delay) {
    return false; // Not enough time has passed
  }

  requestTimestamps.set(key, now); // Update the last call time
  return true; // Enough time has passed
};


// Will upgrade to redis to have support for distriburted systems