import { Store } from 'vuex';
import { displayName } from './utils';
import { RootState } from '@/store';
import type { UserState } from '../types/events';

export default (userstate: UserState, store: Store<RootState>) => {
  return {
    newSubText() {
      return 'NEW';
    },
    doNewSubGlow() {
      return store.state.settings.doNewSubGlow;
    },
    doAnniversaryGlow() {
      return store.state.settings.doAnniversaryGlow;
    },
    showYears() {
      return store.state.settings.showYears;
    },
    username() {
      return displayName(userstate['login'], userstate['display-name']);
    },
    subscriptionMonths() {
      const months = userstate['msg-param-cumulative-months'];
      if (months === true) return this.newSubText();
      return months;
    },
    giftMonths() {
      const months =
        userstate['msg-param-months'] || userstate['msg-param-mass-gift-count'];
      if (months === true) return this.newSubText();
      return months;
    },
    months() {
      return this.subscriptionMonths() || this.giftMonths();
    },
    isYear() {
      const months = this.months();
      if (!months) return false;
      return parseInt(months) % 12 === 0;
    },
    years() {
      if (!this.isYear()) return;
      const months = this.months();
      if (!months) return;
      const years = parseInt(months) / 12;
      if (years === 1) return years + ' year!';
      return years + ' years!';
    },
    cakeTitle() {
      const years = this.years();
      if (!years) return;
      if (this.showYears()) return this.months() + ' months';
      return years.substring(0, years.length - 1);
    },
    doGlow() {
      return (
        (this.doNewSubGlow() && this.months() === this.newSubText()) ||
        (this.doAnniversaryGlow() && this.isYear())
      );
    },
    prepaid() {
      const duration = userstate['msg-param-multimonth-duration'];
      const tenure = userstate['msg-param-multimonth-tenure'];
      if (duration === true) return;
      if (duration && tenure === false) {
        return duration;
      } else {
        return null;
      }
    },
  };
};
