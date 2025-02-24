import type { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';
import VuexNow from 'vuex-now';
import api from '../plugins/axios';
import * as toasts from '../plugins/toasts';
import type { Tip, Cheer, Raid, Sub } from '../types/events';
import type { Item, ListNames } from '../types/lists';
import type { Roomstate, AppState, UserSettings } from '..//types/state';

const now = VuexNow(1000 * 60);
const maxArraySize = 200;

// define your typings for the store state
export interface RootState {
  roomstate: Roomstate;
  appState: AppState;
  settings: UserSettings;
  cheers: Cheer[];
  raids: Raid[];
  subscriptions: Sub[];
  tips: Tip[];
  now?: {
    now: number;
  };
}

const timers: { [key: string]: NodeJS.Timeout } = {};

export const key: InjectionKey<Store<RootState>> = Symbol();

export const store = createStore<RootState>({
  state: {
    roomstate: {},
    appState: {},
    settings: {},

    cheers: [],
    raids: [],
    subscriptions: [],
    tips: [],
  },
  mutations: {
    setAppState(state, payload: AppState) {
      state.appState = Object.assign({}, state.appState, payload);
    },
    setRoomstate(state, payload: Roomstate) {
      state.roomstate = Object.assign({}, state.appState, payload);
    },
    setSettings(state, payload: UserSettings) {
      state.settings = Object.assign({}, state.settings, payload);
    },

    SOCKET_cheer(state, payload: Cheer) {
      const exists = state.cheers.find((x) => x._id === payload._id);
      if (exists) return;
      state.cheers.unshift(payload);
      if (state.cheers.length > maxArraySize) state.cheers.pop();
    },
    SOCKET_raid(state, payload: Raid) {
      const exists = state.raids.find((x) => x._id === payload._id);
      if (exists) return;
      state.raids.unshift(payload);
      if (state.raids.length > maxArraySize) state.raids.pop();
    },
    SOCKET_subscription(state, payload: Sub) {
      const exists = state.subscriptions.find((x) => x._id === payload._id);
      if (exists) return;
      state.subscriptions.unshift(payload);
      if (state.subscriptions.length > maxArraySize) state.subscriptions.pop();
    },
    SOCKET_tip(state, payload: Tip) {
      const exists = state.tips.find((x) => x._id === payload._id);
      if (exists) return;
      state.tips.unshift(payload);
      if (state.tips.length > maxArraySize) state.tips.pop();
    },
    setLists(
      state,
      payload: {
        cheers: Cheer[];
        raids: Raid[];
        subscriptions: Sub[];
        tips: Tip[];
      },
    ) {
      add(payload.cheers, state.cheers);
      add(payload.raids, state.raids);
      add(payload.subscriptions, state.subscriptions);
      add(payload.tips, state.tips);

      function add(array: Item[], target: Item[]) {
        for (let i = array.length - 1; i >= 0; i--) {
          const ids = target.map((x) => x._id);
          if (!ids.includes(array[i]._id)) {
            target.unshift(array[i]);
            if (target.length > maxArraySize) target.pop();
          }
        }
      }
    },
    SOCKET_clear(state, payload: { name: ListNames; id: string }) {
      const prop: Item[] = state[payload.name];
      const doc = prop.find((x: Item) => x._id === payload.id);
      if (doc) doc.cleared = true;
    },
    doClearAll(state) {
      const unclearedCheers: Item[] = state.cheers.filter(
        (x: Item) => !x.cleared,
      );
      const unclearedRaids: Item[] = state.raids.filter(
        (x: Item) => !x.cleared,
      );
      const unclearedSubs: Item[] = state.subscriptions.filter(
        (x: Item) => !x.cleared,
      );
      const unclearedTips: Item[] = state.tips.filter((x: Item) => !x.cleared);
      const uncleared = unclearedCheers.concat(
        unclearedCheers,
        unclearedRaids,
        unclearedSubs,
        unclearedTips,
      );
      uncleared.forEach((x: Item) => (x.cleared = true));
    },
  },
  actions: {
    SOCKET_appState({ commit }, payload: AppState) {
      const key = Object.keys(payload)[0];
      toasts.appState(key, payload[key]);
      commit('setAppState', payload);
    },
    SOCKET_roomstate({ commit }, payload: Roomstate) {
      for (const key in payload) {
        if (key !== 'room-id' && key !== 'channel')
          toasts.roomstate(key, payload[key]);
      }
      commit('setRoomstate', payload);
    },
    SOCKET_state(
      { commit },
      payload: { roomstate: Roomstate; appState: AppState },
    ) {
      commit('setAppState', payload.appState);
      commit('setRoomstate', payload.roomstate);
    },

    SOCKET_clearAll({ commit }) {
      commit('doClearAll');
    },
    clearAll({ commit }) {
      commit('doClearAll');
      api.post('/clear/all').catch();
    },

    getLists({ commit }) {
      api.get('/lists').then(({ data }) => {
        commit('setLists', data);
      });
    },

    updateSettings({ commit }, payload) {
      commit('setSettings', payload);
      api.put('/user/settings', { settings: payload }).catch(() => {
        toasts.error('Error saving User Settings');
      });
    },

    updateSettingsWithCooldown({ commit }, payload) {
      const timer = timers[Object.keys(payload)[0]];
      if (timer) clearTimeout(timer);
      commit('setSettings', payload);
      timers[Object.keys(payload)[0]] = setTimeout(async () => {
        await api.put('/user/settings', { settings: payload }).catch(() => {
          toasts.error('Error saving User Settings');
        });
      }, 500);
    },
  },
  plugins: [now],
});

export function useStore() {
  return baseUseStore(key);
}
