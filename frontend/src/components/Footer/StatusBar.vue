<template>
  <v-row no-gutters align="center">
    <div class="status_indicators">
      <div :class="{ enabled: appState.clientWs }" title="Backend WS" />
      <div :class="{ enabled: appState.twitchIrc }" title="Twitch Chat"></div>
      <div :class="{ enabled: appState.seWs }" title="StreamElements WS" />
    </div>
    <div class="roomstate">
      {{ statusText }}
    </div>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '@/store';
import type { Roomstate, AppState } from '../types/state';

const store = useStore();

const roomstate = computed((): Roomstate => store.state.roomstate);
const appState = computed((): AppState => store.state.appState);

const slow = computed(() => {
  const slow = roomstate.value['slow'];
  if (slow === undefined) return null;
  return slow === false ? null : `Slow: ${slow}`;
});

const followers = computed(() => {
  const followers = roomstate.value['followers-only'];
  if (followers === undefined) return null;
  return followers === '-1'
    ? null
    : `Followers: ${followers === false ? 0 : followers}m`;
});

const sub = computed(() => {
  const sub = roomstate.value['subs-only'];
  if (sub === undefined) return null;
  return !sub ? null : 'Sub';
});

const r9k = computed(() => {
  const r9k = roomstate.value['r9k'];
  if (r9k === undefined) return null;
  return !r9k ? null : 'r9k';
});

const emote = computed(() => {
  const emote = roomstate.value['emote-only'];
  if (emote === undefined) return null;
  return !emote ? null : 'EmoteOnly';
});

const raidmode = computed(() => {
  const raidmode = appState.value.raidmode;
  if (raidmode === undefined) return null;
  return !raidmode ? null : 'Raidmode';
});

const statusText = computed(() => {
  const arr = [
    slow.value,
    sub.value,
    followers.value,
    r9k.value,
    emote.value,
    raidmode.value,
  ];
  const filtered = arr.filter((x) => x);
  if (!filtered.length) return '';
  return `[${filtered.join('|')}]`;
});
</script>

<style scoped>
.status_indicators {
  display: flex;
  align-items: center;
  padding: 4px 0 4px;
}

.status_indicators > div {
  background-color: rgba(217, 49, 49, 0.9);
  height: 16px;
  width: 16px;
  border-radius: 8px;
  margin-right: 6px;
}

.status_indicators > div.enabled {
  background-color: rgba(57, 116, 65, 0.9);
}

.roomstate {
  font-size: 14px;
  color: #bababa;
}
</style>
