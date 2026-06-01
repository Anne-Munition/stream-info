export interface Roomstate {
  slow?: boolean | string;
  'followers-only'?: boolean | string;
  'subs-only'?: boolean;
  r9k?: boolean;
  'emote-only'?: boolean;
  [key: string]: boolean | string;
}

export interface AppState {
  clientWs?: boolean;
  twitchIrc?: boolean;
  seWs?: boolean;
  raidmode?: boolean;
  tokenInvalid?: boolean;
  [key: string]: boolean;
}

export interface UserSettings {
  doNewSubGlow?: boolean;
  doAnniversaryGlow?: boolean;
  showYears?: boolean;
  showPaidUpgrades?: boolean;
  animatedEmotes?: boolean;
  showBitValues?: boolean;
  showCheerTotalValue?: boolean;
  animatedCheermotes?: boolean;
  showGameTitle?: boolean;
  showStreamTitle?: boolean;
  showStreamLength?: boolean;
  showRoomstateToasts?: boolean;
  showRaidmodeToasts?: boolean;
  doGradiant?: boolean;

  defaultSlow?: number;
  defaultFollowers?: number;
  toastDuration?: number;

  [key: UserSettingKeys]: boolean | number;
}

export type UserSettingKeys =
  | 'doNewSubGlow'
  | 'doAnniversaryGlow'
  | 'showYears'
  | 'showPaidUpgrades'
  | 'animatedEmotes'
  | 'showBitValues'
  | 'showCheerTotalValue'
  | 'animatedCheermotes'
  | 'showGameTitle'
  | 'showStreamTitle'
  | 'showStreamLength'
  | 'showRoomstateToasts'
  | 'showRaidmodeToasts'
  | 'defaultSlow'
  | 'defaultFollowers'
  | 'toastDuration'
  | 'doGradiant';
