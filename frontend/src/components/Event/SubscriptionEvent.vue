<template>
  <div v-if="!hide">
    <EventCard v-if="isGift" :data="data">
      <SubGift :data="data" />
      <template #footer>
        <SubFooter :userstate="data.payload.userstate" />
      </template>
    </EventCard>
    <EventCard v-else-if="isUpgrade" :data="data">
      <PaidUpgrade :data="data" />
      <template #footer>
        <SubFooter :userstate="data.payload.userstate" />
      </template>
    </EventCard>
    <EventCard v-else :data="data">
      <SubResub :data="data" />
      <template #footer>
        <SubFooter :userstate="data.payload.userstate" />
      </template>
    </EventCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EventCard from './EventCard.vue';
import PaidUpgrade from './Subscription/PaidUpgrade.vue';
import SubFooter from './Subscription/SubFooter.vue';
import SubGift from './Subscription/SubGift.vue';
import SubResub from './Subscription/SubResub.vue';
import { useStore } from '@/store';
import type { Sub } from '../types/events';

const store = useStore();

const props = defineProps<{
  data: Sub;
}>();

const showPaidUpgrades = computed(() => store.state.settings.showPaidUpgrades);

const isGift = computed(() => {
  const giftMsgIds = ['subgift', 'submysterygift'];
  return giftMsgIds.includes(props.data.payload.userstate['msg-id']);
});

const isUpgrade = computed(() => {
  const upgradeMsgIds = [
    'primepaidupgrade',
    'giftpaidupgrade',
    'anongiftpaidupgrade',
  ];
  return upgradeMsgIds.includes(props.data.payload.userstate['msg-id']);
});

const hide = computed(() => {
  return isUpgrade.value && !showPaidUpgrades.value;
});
</script>
