<template>
  <HypeChat v-if="isHypeChat" :data="data" />
  <BitsCheer v-else :data="data" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BitsCheer from './Cheer/BitsCheer.vue';
import HypeChat from './Cheer/HypeChat.vue';
import type { Cheer, HypeChatUserState } from '../types/events';

const props = defineProps<{
  data: Cheer;
}>();

const isHypeChat = computed((): boolean => {
  const userstate = props.data.payload.userstate as HypeChatUserState;
  return Boolean(userstate['pinned-chat-paid-amount']);
});
</script>
