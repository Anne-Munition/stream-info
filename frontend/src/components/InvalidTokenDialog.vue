<template>
  <v-dialog v-model="showDialog" width="auto">
    <v-card width="720">
      <v-card-title>Twitch Token</v-card-title>
      <v-card-text class="text-center">
        <p>
          The current Twitch Token has been invalidated or is missing the
          required scopes.
        </p>
        <p>Please follow the link below to refresh the token.</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          variant="elevated"
          @click="renewToken"
          class="mb-3"
        >
          RENEW TOKEN
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useStore } from '@/store';
import { computed } from 'vue';

const store = useStore();

const showDialog = computed(() => !store.state.tokenValid);

function renewToken() {
  // window.location.href = '/api/auth/login';
}
</script>

<style scoped></style>
