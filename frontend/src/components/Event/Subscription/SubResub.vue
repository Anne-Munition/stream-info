<template>
  <div>
    <div>
      <div v-if="prepaid" class="subtext prepaid">
        Prepaid for {{ prepaid }} months!
      </div>
      <span class="name">{{ username }}</span>
      <template v-if="!isYear || !showYears">
        <span class="amount" :class="{ glow: glow }">&nbsp;{{ months }}</span>
        <span v-if="months !== newSubText">&nbsp;months</span>
      </template>
      <template v-else>
        <span class="amount" :class="{ glow: glow }">&nbsp;{{ years }}</span>
      </template>
      <span v-if="isYear">
        <img class="cake" :src="cake" alt="" :title="cakeTitle" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import cake from '@/assets/images/cake.svg';
import subComputed from '@/plugins/sub_computed';
import { useStore } from '@/store';
import type { Sub } from '../../types/events';

const store = useStore();

const props = defineProps<{
  data: Sub;
}>();

const userstate = computed(() => props.data.payload.userstate);
const subComp = subComputed(userstate.value, store);

const username = subComp.username();
const isYear = subComp.isYear();
const newSubText = subComp.newSubText();
const months = subComp.months();
const years = subComp.years();
const prepaid = subComp.prepaid();

const glow = computed(() => subComp.doGlow());
const showYears = computed(() => subComp.showYears());
const cakeTitle = computed(() => subComp.cakeTitle());
</script>

<style scoped>
.cake {
  height: 20px;
  position: relative;
  top: 3px;
  margin-left: 5px;
}

.prepaid {
  color: #00ff00;
}
</style>
