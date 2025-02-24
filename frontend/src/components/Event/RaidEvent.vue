<template>
  <EventCard :data="data">
    <div>
      <span class="name">{{ username }}</span>
      raided with
      <span class="amount">{{ data.payload.viewers }}</span>
      viewers
    </div>
    <div class="subtext">
      <span v-if="displayLastGame">{{ data.payload.game }}</span>
      <span v-if="useSpacer"> - </span>
      <span v-if="displayStreamLength">{{ data.payload.streamLength }}</span>
      <div v-if="displayTitle">{{ data.payload.title }}</div>
    </div>
    <template #footer>
      <div class="card-footer"></div>
    </template>
  </EventCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EventCard from './EventCard.vue';
import { displayName } from '@/plugins/utils';
import { useStore } from '@/store';
import type { Raid } from '../types/events';

const store = useStore();

const props = defineProps<{
  data: Raid;
}>();

const showGameTitle = computed(() => store.state.settings.showGameTitle);
const showStreamLength = computed(() => store.state.settings.showStreamLength);
const showStreamTitle = computed(() => store.state.settings.showStreamTitle);

const displayLastGame = computed(() => {
  return showGameTitle.value && Boolean(props.data.payload.game);
});

const displayStreamLength = computed(() => {
  return showStreamLength.value && Boolean(props.data.payload.streamLength);
});

const displayTitle = computed(() => {
  return showStreamTitle.value && props.data.payload.title;
});

const useSpacer = computed(() => {
  return displayStreamLength.value && displayLastGame.value;
});

const username = computed(() => {
  return displayName(
    props.data.payload.username,
    props.data.payload.displayName,
  );
});
</script>
