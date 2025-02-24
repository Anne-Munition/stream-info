<template>
  <div>
    <Timestamp :date="data.createdAt" />
    <slot />
    <Message
      v-if="hasMessage"
      :payload="messagePayload"
      :do-decode="doDecode"
    />
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Timestamp from '../TimeStamp.vue';
import Message from '../UserMessage.vue';
import type { Event, MessagePayload } from '../types/events';

const props = defineProps<{
  data: Event;
  doDecode?: boolean;
}>();

const hasMessage = computed(() => {
  return Object.keys(props.data.payload).includes('message');
});

const messagePayload = computed((): MessagePayload => {
  return props.data.payload as MessagePayload;
});
</script>

<style scoped></style>
