<template>
  <div v-if="!loading" class="container">
    <v-row no-gutters align="center">
      <h1>User Settings</h1>
      <v-spacer />
      <HomeButton />
    </v-row>
    <div v-if="!loading">
      <v-row>
        <v-col cols="6">
          <h3>Subscriptions:</h3>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="doNewSubGlow"
                label="New Sub Glow"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="doAnniversaryGlow"
                label="Anniversary Glow"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showYears"
                label="Show Anniversary in Years"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showPaidUpgrades"
                label="Show Paid Upgrades"
                color="secondary"
                hide-details
              />

              <h3>General:</h3>
              <v-switch
                v-model="doGradiant"
                label="Bottom Fade Gradiant"
                color="secondary"
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <div class="column">
                <div>
                  <Subscription
                    v-for="subscription in subscriptions"
                    :key="subscription._id"
                    :class="{ uncleared: !subscription.cleared }"
                    :data="subscription"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <h3>Emotes:</h3>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="animatedEmotes"
                label="Animated Emotes"
                color="secondary"
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <div class="column">
                <div>
                  <Subscription
                    v-for="subscription in [examples.animatedEmote]"
                    :key="subscription._id"
                    :class="{ uncleared: !subscription.cleared }"
                    :data="subscription"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
          <h3>Cheers:</h3>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="showBitValues"
                label="Show Bit Values"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showCheerTotalValue"
                label="Show Cheer Total Value"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="animatedCheermotes"
                label="Animated Cheermotes"
                color="secondary"
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <div class="column">
                <div>
                  <Cheer
                    v-for="cheer in [examples.cheer, examples.largeCheer]"
                    :key="cheer._id"
                    :class="{ uncleared: !cheer.cleared }"
                    :data="cheer"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
          <h3>Raids:</h3>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="showGameTitle"
                label="Show Game Title"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showStreamTitle"
                label="Show Stream Title"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showStreamLength"
                label="Show Stream Length"
                color="secondary"
                hide-details
              />
            </v-col>
            <v-col cols="8">
              <div class="column">
                <div>
                  <Raid
                    v-for="raid in [examples.raid]"
                    :key="raid._id"
                    :class="{ uncleared: !raid.cleared }"
                    :data="raid"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-divider class="mt-4"></v-divider>

      <v-row>
        <v-col cols="6">
          <h3>Chat Toggle Durations:</h3>
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="defaultSlow"
                label="Slow Mode (Seconds)"
                type="number"
                min="1"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="defaultFollowers"
                label="Follower Only (Minutes)"
                type="number"
                min="0"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6">
          <h3>Toast Notifications:</h3>
          <v-row>
            <v-col cols="4">
              <v-switch
                v-model="showRoomstateToasts"
                label="Show Roomstate Toasts"
                color="secondary"
                hide-details
              />
              <v-switch
                v-model="showRaidmodeToasts"
                label="Show Raidmode Toasts"
                color="secondary"
                hide-details
              />
            </v-col>
            <v-col cols="4" class="toast-duration">
              <v-text-field
                v-model="toastDuration"
                label="Toast Duration (ms)"
                type="number"
                min="0"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Cheer from '@/components/Event/CheerEvent.vue';
import Raid from '@/components/Event/RaidEvent.vue';
import Subscription from '@/components/Event/SubscriptionEvent.vue';
import HomeButton from '@/components/HomeButton.vue';
import examples from '@/examples';
import api from '@/plugins/axios';
import { useStore } from '@/store';
import type { UserSettingKeys } from '../types/state';

const store = useStore();

const loading = ref(true);

onMounted(() => {
  if (!Object.keys(settings.value).length) {
    api
      .get('/user/settings')
      .then(({ data }) => {
        store.commit('setSettings', data);
        loading.value = false;
      })
      .catch(() => {
        window.location.href = '/api/auth/login';
      });
  } else {
    loading.value = false;
  }
});

const subscriptions = [
  examples.newSub,
  examples.prepaid,
  examples.sub,
  examples.anniversary,
  examples.giftSub,
  examples.multiMonthGift,
  examples.massGift,
  examples.paidUpgrade.paidUpgrade,
  examples.paidUpgrade.primepaidupgrade,
];

const settings = computed(() => store.state.settings);

function getSetBool(key: UserSettingKeys) {
  return computed({
    get: () => settings.value[key],
    set: (val) => {
      store.dispatch('updateSettings', { [key]: val });
    },
  });
}

function getSetCooldown(key: UserSettingKeys) {
  return computed({
    get: () => settings.value[key],
    set: (val) => {
      store.dispatch('updateSettingsWithCooldown', { [key]: val });
    },
  });
}

const doNewSubGlow = getSetBool('doNewSubGlow');
const doAnniversaryGlow = getSetBool('doAnniversaryGlow');
const showYears = getSetBool('showYears');
const showPaidUpgrades = getSetBool('showPaidUpgrades');
const animatedEmotes = getSetBool('animatedEmotes');
const showBitValues = getSetBool('showBitValues');
const showCheerTotalValue = getSetBool('showCheerTotalValue');
const animatedCheermotes = getSetBool('animatedCheermotes');
const showGameTitle = getSetBool('showGameTitle');
const showStreamTitle = getSetBool('showStreamTitle');
const showStreamLength = getSetBool('showStreamLength');
const showRoomstateToasts = getSetBool('showRoomstateToasts');
const showRaidmodeToasts = getSetBool('showRaidmodeToasts');
const doGradiant = getSetBool('doGradiant');

const defaultSlow = getSetCooldown('defaultSlow');
const defaultFollowers = getSetCooldown('defaultFollowers');
const toastDuration = getSetCooldown('toastDuration');
</script>

<style scoped>
.column {
  width: 100%;
  height: auto;
}
.container {
  padding: 10px;
}
h3 {
  margin-top: 10px;
  margin-bottom: 5px;
}
</style>
