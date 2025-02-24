<template>
  <div class="gift">
    <div>
      <span class="name">{{ username }}&nbsp;</span>
      <span v-if="isSubGift">
        <span>gifted</span>
        <span v-if="giftMultiMonths" class="multiMonths">
          &nbsp;{{ giftMultiMonths }}
        </span>
        <span>:</span>
      </span>
      <span v-else>
        <span>gifted</span>
        <span class="amount">&nbsp;{{ massGiftMonths }}&nbsp;</span>
        <span v-if="massGiftMonths === 1">sub!</span>
        <span v-else>subs!</span>
      </span>
    </div>
    <div v-if="isSubGift">
      <span class="name giftee">{{ giftee }}</span>
      <span class="amount" :class="{ glow: glow }">&nbsp;{{ months }}</span>
      <span v-show="months !== newSubText">&nbsp;months</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import subComputed from '@/plugins/sub_computed';
import { displayName } from '@/plugins/utils';
import { useStore } from '@/store';
import type { Sub } from '../../types/events';

const store = useStore();

const props = defineProps<{
  data: Sub;
}>();

const userstate = computed(() => props.data.payload.userstate);
const subComp = subComputed(userstate.value, store);

const username = subComp.username();
const months = subComp.months();
const newSubText = subComp.newSubText();

const glow = computed(() => {
  return subComp.doGlow();
});

const isSubGift = computed(() => {
  return userstate.value['msg-id'] === 'subgift';
});

const giftee = computed(() => {
  if (!userstate.value['msg-param-recipient-user-name']) return;
  return displayName(
    userstate.value['msg-param-recipient-user-name'],
    userstate.value['msg-param-recipient-display-name'],
  );
});

const massGiftMonths = computed(() => {
  const months = userstate.value['msg-param-mass-gift-count'];
  if (months === true) return 1;
  return months;
});

const giftMultiMonths = computed(() => {
  const months = userstate.value['msg-param-gift-months'];
  if (months === true) return false;
  return months + ' months';
});
</script>

<style scoped>
.giftee {
  font-size: 1em;
}
</style>
