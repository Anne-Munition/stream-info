<template>
  <div id="column-container">
    <div class="column">
      <div>
        <Tip
          v-for="tip in tips"
          :key="tip._id"
          :class="{ uncleared: !tip.cleared }"
          :data="tip"
          @click="clear('tips', tip)"
        />
      </div>
    </div>
    <div class="column">
      <div>
        <Subscription
          v-for="subscription in subscriptions"
          :key="subscription._id"
          :class="{ uncleared: !subscription.cleared }"
          :data="subscription"
          @click="clear('subscriptions', subscription)"
        />
      </div>
    </div>
    <div class="column">
      <div>
        <Cheer
          v-for="cheer in cheers"
          :key="cheer._id"
          :class="{ uncleared: !cheer.cleared }"
          :data="cheer"
          @click="clear('cheers', cheer)"
        />
      </div>
    </div>
    <div class="column">
      <div>
        <Raid
          v-for="raid in raids"
          :key="raid._id"
          :class="{ uncleared: !raid.cleared }"
          :data="raid"
          @click="clear('raids', raid)"
        />
      </div>
    </div>
  </div>
  <div v-if="doGradiant" class="gradient"></div>
  <HomeFooter />
</template>

<script setup lang="ts">
import IdleJs from 'idle-js';
import { onMounted, computed, onUnmounted } from 'vue';
import Cheer from '@/components/Event/CheerEvent.vue';
import Raid from '@/components/Event/RaidEvent.vue';
import Subscription from '@/components/Event/SubscriptionEvent.vue';
import Tip from '@/components/Event/TipEvent.vue';
import HomeFooter from '@/components/Footer/HomeFooter.vue';
import api from '@/plugins/axios';
import * as socket from '@/plugins/socket.io';
import { overflow } from '@/plugins/utils';
import { useStore } from '@/store';
import type { Item } from '../types/lists';

const store = useStore();

const idle = new IdleJs({
  idle: 30000,
  events: ['mousemove', 'keydown', 'mousedown', 'touchstart'],
  onIdle: function () {
    const e = document.getElementById('column-container');
    if (!e) return;
    for (let i = 0; i < e.children.length; i++) {
      if (e.children[i].classList.contains('column')) {
        e.children[i].scrollTo(0, 0);
      }
    }
  },
  keepTracking: true,
  startAtIdle: true,
});
idle.start();

onMounted(() => {
  overflow(true);
  api
    .get('/user/settings')
    .then(({ data }: { data: string }) => {
      store.commit('setSettings', data);
      socket.connect();
    })
    .catch(() => {
      window.location.href = '/api/auth/login';
    });
});

onUnmounted(() => {
  overflow(false);
});

function clear(name: string, item: Item) {
  if (item.cleared) return;
  item.cleared = true;
  api.post('/clear', { name, id: item._id }).catch();
}

const doGradiant = computed(() => store.state.settings.doGradiant);

const cheers = computed(() => store.state.cheers);
const raids = computed(() => store.state.raids);
const subscriptions = computed(() => store.state.subscriptions);
const tips = computed(() => store.state.tips);
</script>

<style scoped>
.gradient {
  pointer-events: none;
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: -webkit-linear-gradient(
    top,
    rgba(20, 20, 20, 0) 0%,
    rgba(20, 20, 20, 0.75) 60%,
    rgba(20, 20, 20, 1) 100%
  );
}
</style>
