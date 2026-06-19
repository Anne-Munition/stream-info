import defaults from './defaultUserSettings';

function sanitizeNonNegativeNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export default function sanitizeUserSettings(
  settings?: Partial<UserSettings> | null,
): UserSettings {
  const merged = { ...defaults, ...(settings || {}) };

  return {
    ...merged,
    defaultSlow: sanitizeNonNegativeNumber(merged.defaultSlow, defaults.defaultSlow),
    defaultFollowers: sanitizeNonNegativeNumber(merged.defaultFollowers, defaults.defaultFollowers),
    toastDuration: sanitizeNonNegativeNumber(merged.toastDuration, defaults.toastDuration),
  };
}
