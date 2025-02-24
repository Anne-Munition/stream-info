<template>
  <div>
    <span class="name">{{ username }}&nbsp;</span>
    <div class="subtext">
      <template v-if="userstate['msg-id'] === 'primepaidupgrade'">
        upgraded from a <span class="prime">prime sub</span> to a
        <span class="white">{{ tier }}</span> sub.
      </template>
      <template v-else>
        is continuing the gift sub they got from
        <span class="white">{{ sender }}</span>
        <span>.</span>
      </template>
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

const sender = displayName(
  userstate.value['msg-param-sender-login'] || 'Anonymous',
  userstate.value['msg-param-sender-name'],
);

const tier = computed(() => {
  switch (userstate.value['msg-param-sub-plan']) {
    case '1000':
      return 'Tier 1';
    case '2000':
      return 'Tier 2';
    case '3000':
      return 'Tier 3';
    default:
      return '';
  }
});
</script>

<style scoped>
.white {
  color: white;
}
.prime {
  color: #0382b8;
}
</style>
