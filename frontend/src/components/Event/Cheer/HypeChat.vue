<template>
  <EventCard :data="data">
    <v-row no-gutters align="center">
      <span class="name">{{ username }}</span>
      <span class="hypechat-amount mx-2" :class="`tier-${tier}`">
        {{ currencySymbol }}{{ dollars }}
      </span>
      <span v-if="showCheerTotalValue && currency !== 'USD'" class="dollars">
        ${{ usd }}
      </span>
    </v-row>
    <template #footer>
      <div class="card-footer"></div>
    </template>
  </EventCard>
</template>

<script setup lang="ts">
import getSymbolFromCurrency from 'currency-symbol-map';
import { computed } from 'vue';
import EventCard from '../EventCard.vue';
import { useStore } from '@/store';
import type { Cheer, HypeChatUserState } from '../../types/events';

const store = useStore();

const props = defineProps<{
  data: Cheer;
}>();

const userstate = computed((): HypeChatUserState => {
  return props.data.payload.userstate as HypeChatUserState;
});

const username = computed(() => {
  return userstate.value['display-name'];
});

const amount = computed(() => {
  return userstate.value['pinned-chat-paid-amount'];
});

const dollars = computed(() => {
  const bits = amount.value;
  if (!bits) return '';
  const value = parseInt(bits) / 100;
  if (value % 1 !== 0) {
    return value.toFixed(2);
  } else {
    return value.toString();
  }
});

const currency = computed(() => {
  return userstate.value['pinned-chat-paid-currency'];
});

const currencySymbol = computed(() => {
  return getSymbolFromCurrency(currency.value);
});

const showCheerTotalValue = computed(() => {
  return store.state.settings.showCheerTotalValue;
});

const usd = computed(() => {
  const bits = canonicalAmount.value;
  if (!bits) return '';
  const value = parseInt(bits) / 100;
  if (value % 1 !== 0) {
    return value.toFixed(2);
  } else {
    return value.toString();
  }
});

const canonicalAmount = computed(() => {
  return userstate.value['pinned-chat-paid-canonical-amount'];
});

const tier = computed(() => {
  const tiers = [100, 500, 1000, 2000, 5000, 10000, 20000, 30000, 40000, 50000];
  const num = parseInt(canonicalAmount.value);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (num >= tiers[i]) return tiers[i];
  }
  return 100;
});
</script>

<style scoped>
.hypechat-amount {
  height: 24px;
  padding: 2px 12px 2px 12px;
  border-radius: 26px;
  color: white;
  display: flex;
  align-items: center;
}

.tier-100 {
  background-color: #6b816e;
}

.tier-500 {
  background-color: #32843b;
}

.tier-1000 {
  background-color: #007a6c;
}

.tier-2000 {
  background-color: #0080a9;
}

.tier-5000 {
  background-color: #0070db;
}

.tier-10000 {
  background-color: #016dda;
}

.tier-20000 {
  background-color: #5060fc;
}

.tier-30000 {
  background-color: #d211a3;
}

.tier-40000 {
  background-color: #cb4227;
}

.tier-50000 {
  background-color: #cf0110;
}

.dollars {
  color: gray;
  font-size: 0.8em;
  position: relative;
  bottom: 3px;
  margin-left: 3px;
}
</style>
