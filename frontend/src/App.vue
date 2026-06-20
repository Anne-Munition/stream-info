<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/store';

const router = useRouter();
const store = useStore();

watch(
  () => store.state.appState.tokenInvalid,
  (tokenInvalid, previousTokenInvalid) => {
    if (tokenInvalid && router.currentRoute.value.name !== 'Reauth') {
      router.push({ name: 'Reauth' });
      return;
    }

    if (
      tokenInvalid === false &&
      previousTokenInvalid &&
      router.currentRoute.value.name === 'Reauth'
    ) {
      router.replace({ name: 'Home' });
    }
  },
  { immediate: true },
);
</script>
