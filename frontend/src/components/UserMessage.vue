<template>
  <div class="message">
    <template v-for="(fragment, i) in textFragments" :key="i">
      <Emote
        v-if="payload.emotes && fragment.isEmote"
        :data="payload.emotes[fragment.text]"
        :name="fragment.text"
      />
      <span v-else class="text-fragment">{{ fragment.text }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { decode } from 'html-entities';
import { computed } from 'vue';
import Emote from './EmoteImg.vue';
import type { MessagePayload } from '../../types/events';

const props = defineProps<{
  payload: MessagePayload;
  doDecode?: boolean;
}>();

const decoded = computed((): string => {
  if (!props.payload.message) return '';
  if (props.doDecode) return decode(props.payload.message);
  return props.payload.message;
});

const words = computed((): string[] => {
  if (!props.payload.message) return [];
  return decoded.value.split(' ');
});

interface TextFragment {
  isEmote: boolean;
  text: string;
}

const textFragments = computed((): TextFragment[] => {
  const wordCount = words.value.length;
  if (!wordCount) return [];
  const fragments: TextFragment[] = [];
  let wordFragment: string[] = [];

  function addSpace(i?: number) {
    return i !== undefined && i !== wordCount;
  }

  function addTextFragment(i?: number) {
    if (wordFragment.length) {
      if (addSpace(i)) wordFragment.push(' ');
      fragments.push({
        isEmote: false,
        text: wordFragment.join(' '),
      });
      wordFragment = [];
    }
  }

  words.value.forEach((word: string, i: number) => {
    if (isEmote(word)) {
      addTextFragment(i);
      fragments.push({
        isEmote: true,
        text: word,
      });
      if (addSpace(i)) wordFragment.push(' ');
    } else {
      wordFragment.push(word);
    }
  });
  addTextFragment();
  return fragments;
});

function isEmote(word: string): boolean {
  if (!props.payload.emotes) return false;
  return Boolean(props.payload.emotes[word]);
}
</script>

<style scoped></style>
