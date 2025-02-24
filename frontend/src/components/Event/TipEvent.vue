<template>
  <EventCard :data="data" :do-decode="true">
    <span class="name">{{ data.payload.username }}</span>
    <span class="amount">&nbsp;${{ amount }}</span>
    <template #footer>
      <div class="card-footer"></div>
    </template>
  </EventCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EventCard from './EventCard.vue';
import type { Tip } from '../types/events';

const props = defineProps<{
  data: Tip;
}>();

const amount = computed(() => {
  const value = props.data.payload.amount;
  if (value % 1 !== 0) {
    return value.toFixed(2);
  } else {
    return value;
  }
});
</script>
