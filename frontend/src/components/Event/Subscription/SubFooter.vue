<template>
  <div class="card-footer">
    <v-row class="icons" no-gutters>
      <v-spacer />
      <v-icon v-if="isUpgrade">mdi-chevron-double-up</v-icon>
      <template v-if="subPlan">
        <img v-if="subPlan === 'Prime'" :src="prime" alt="Prime" />
        <img v-else-if="subPlan === '2000'" :src="tier2" alt="Tier2" />
        <img v-else-if="subPlan === '3000'" :src="tier3" alt="Tier3" />
      </template>
      <img v-if="isGift" :src="giftIcon" alt="Gift" />
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import giftIcon from '@/assets/images/gift-icon.png';
import prime from '@/assets/images/prime.png';
import tier2 from '@/assets/images/tier2.png';
import tier3 from '@/assets/images/tier3.png';
import type { UserState } from '../../types/events';

const props = defineProps<{
  userstate: UserState;
}>();

const subPlan = computed(() => {
  return props.userstate['msg-param-sub-plan'];
});

const isUpgrade = computed(() => {
  return props.userstate['msg-id'].includes('upgrade');
});

const isGift = computed(() => {
  return props.userstate['msg-id'].includes('gift') && !isUpgrade.value;
});
</script>

<style scoped>
.card-footer {
  width: 100%;
}

.icons {
  position: relative;
  bottom: 6px;
  left: 3px;
}

.icons img {
  height: 16px;
  width: 16px;
  margin-left: 5px;
}

.mdi-chevron-double-up {
  color: rgb(47, 214, 214);
  height: 16px;
  width: 16px;
  padding: 0;
  margin: 0 0 0 5px;
}
</style>
