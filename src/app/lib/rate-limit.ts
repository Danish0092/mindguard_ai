
type Entry = {
  count: number;
  resetAt: number;
};

const entries = new Map<string, Entry>();

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
) {
  const now = Date.now();
  const entry = entries.get(key);

  if (!entry || now >= entry.resetAt) {
    entries.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;

  return {
    success: true,
    remaining: limit - entry.count,
  };
}
