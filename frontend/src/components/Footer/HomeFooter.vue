<template>
  <v-footer
    app
    fixed
    padless
    bottom
    width="100%"
    class="ma-0 pa-1"
    @mouseleave="mouseleave"
    @mouseenter="mouseenter"
  >
    <v-row v-if="!expanded" no-gutters align="center" class="mx-2">
      <v-col cols="4">
        <v-row no-gutters>
          <StatusBar />
        </v-row>
      </v-col>
      <v-col cols-="4">
        <v-row no-gutters justify="center">
          <div class="chevron" @click="expanded = !expanded">
            <v-icon>mdi-chevron-up</v-icon>
          </div>
        </v-row>
      </v-col>
      <v-col cols="4">
        <v-row no-gutters>
          <v-spacer />
          <MultiButton />
        </v-row>
      </v-col>
    </v-row>

    <v-container v-else class="mt-0 pt-0">
      <v-row no-gutters>
        <v-col cols="12">
          <v-row
            no-gutters
            justify="center"
            align="center"
            class="ma-0 pa-0 mb-3"
          >
            <div class="chevron" @click="expanded = !expanded">
              <v-icon>mdi-chevron-down</v-icon>
            </div>
          </v-row>
        </v-col>
      </v-row>
      <HomeFooterCard><HoursTracking /></HomeFooterCard>
      <!-- <HomeFooterCard><ChatToggles /></HomeFooterCard> -->
      <HomeFooterCard><ActionRow /></HomeFooterCard>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ActionRow from './ActionRow.vue';
// import ChatToggles from './ChatToggles.vue';
import HomeFooterCard from './HomeFooterCard.vue';
import HoursTracking from './HoursTracking.vue';
import MultiButton from './MultiButton.vue';
import StatusBar from './StatusBar.vue';

const expanded = ref(false);
let timer: NodeJS.Timeout;

function mouseenter() {
  if (timer) clearTimeout(timer);
}

function mouseleave() {
  timer = setTimeout(() => {
    closeFooter();
  }, 600);
}

function closeFooter() {
  expanded.value = false;
}
</script>

<style scoped>
.chevron {
  cursor: pointer;
}
</style>
