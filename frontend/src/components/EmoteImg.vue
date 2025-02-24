<template>
  <span class="emoticon">
    <img :src="src" :alt="name" :title="name" />
    <span
      v-if="data.source === 'cheermote' && showBitValues"
      :class="`tier_${data.tier}`"
    >
      {{ data.value }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '@/store';
import type { Emote } from '../../types/events';

const store = useStore();

const props = defineProps<{
  data: Emote;
  name: string;
}>();

const showBitValues = computed(() => store.state.settings.showBitValues);
const animatedEmotes = computed(() => store.state.settings.animatedEmotes);
const animatedCheermotes = computed(
  () => store.state.settings.animatedCheermotes,
);

const src = computed(() => {
  if (props.data.source === 'cheermote') {
    return animatedCheermotes.value && props.data.animated
      ? props.data.animated
      : props.data.static;
  } else {
    return animatedEmotes.value && props.data.animated
      ? props.data.animated
      : props.data.static;
  }
});
</script>

<style scoped>
.emoticon img {
  height: 26px;
  position: relative;
  top: 2px;
  margin: -5px 1px;
}

.tier_0 {
  color: #f9d71a;
}

.tier_1 {
  color: #979797;
}

.tier_100 {
  color: #9c3ee8;
}

.tier_1000 {
  color: #1db2a5;
}

.tier_5000 {
  color: #0099fe;
}

.tier_10000 {
  color: #f43021;
}

.tier_100000 {
  color: #ffcb13;
}
</style>
