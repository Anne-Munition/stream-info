import { updateAppState } from './events/state';

let tokenInvalid = false;

export function isTokenInvalid(): boolean {
  return tokenInvalid;
}

export function markTokenInvalid(): void {
  tokenInvalid = true;
  updateAppState({ tokenInvalid: true });
}

export function clearTokenInvalid(): void {
  tokenInvalid = false;
  updateAppState({ tokenInvalid: false });
}
