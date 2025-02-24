<template>
  <div v-if="terms.length">
    <v-row no-gutters class="pa-3" align="center">
      <h1>Suspicious Follower Terms</h1>
      <img class="ml-2" :src="anneSus" alt="anneSus" height="32" />
      <v-spacer />
      <HomeButton />
    </v-row>
    <v-row justify="center">
      <v-col cols="4">
        <v-row>
          <v-spacer />
          <v-btn
            append-icon="mdi-plus-circle-outline"
            color="secondary"
            @click="add"
          >
            Add Term
          </v-btn>
        </v-row>
        <v-row class="mt-5">
          <v-table class="table" theme="light">
            <tbody>
              <tr v-if="!terms.length" class="no-data">
                <td v-if="loading" style="text-align: center">
                  <v-progress-circular
                    size="24"
                    indeterminate
                    color="primary"
                    theme="dark"
                  />
                </td>
                <td v-else>No Data</td>
              </tr>
              <tr v-for="(term, i) in sortedTerms" :key="i">
                <td>{{ term.name }}</td>
                <td class="text-right actions">
                  <v-icon class="mr-2" @click="edit(i)">mdi-pencil</v-icon>
                  <v-icon @click="remove(i)">mdi-delete</v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-row>
      </v-col>
    </v-row>
    <v-dialog v-model="addDialog">
      <v-card theme="light" min-width="400">
        <v-card-title>Add Term</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedTerm.name"
            placeholder="New Term"
            flat
            autofocus
            single-line
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="addDialog = false">Cancel</v-btn>
          <v-btn color="blue" @click="confirmAdd">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog">
      <v-card theme="light" min-width="400">
        <v-card-title>Edit Term</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="selectedTerm.name"
            placeholder="New Term"
            flat
            autofocus
            single-line
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="green" @click="confirmEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="removeDialog">
      <v-card theme="light" min-width="400">
        <v-card-title>
          Delete Term:
          <span class="bold">{{ selectedTerm.name }}</span>
        </v-card-title>
        <v-card-text> Are you sure you want to delete this term? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="red" @click="removeDialog = false">No</v-btn>
          <v-btn color="green" @click="confirmRemove">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import anneSus from '@/assets/images/anneSus.png';
import HomeButton from '@/components/HomeButton.vue';
import api from '@/plugins/axios';
import * as toasts from '@/plugins/toasts';
import type { Term } from '../types/terms';

const terms = ref([] as Term[]);
const selectedTerm = ref({} as Term);
const loading = ref(true);

const sortedTerms = computed(() => {
  if (!terms.value.length) return [];
  return [...terms.value].sort((a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
  });
});

onMounted(() => {
  api
    .get('/terms')
    .then(({ data }) => {
      terms.value = data;
    })
    .catch(() => {
      window.location.href = '/api/auth/login';
    })
    .finally(() => {
      loading.value = false;
    });
});

const addDialog = ref(false);
function add() {
  selectedTerm.value = {} as Term;
  addDialog.value = true;
}
function confirmAdd() {
  if (
    !selectedTerm.value ||
    terms.value.find((x) => x.name === selectedTerm.value.name)
  ) {
    resetDialogs();
    return;
  }
  api
    .post('/terms', selectedTerm.value)
    .then(({ data }) => {
      terms.value.push(data);
      resetDialogs();
      toasts.success('Term added.');
    })
    .catch(() => {
      toasts.error('Error saving term.');
    });
}

const editDialog = ref(false);
function edit(index: number) {
  selectedTerm.value = { ...sortedTerms.value[index] };
  editDialog.value = true;
}
function confirmEdit() {
  if (!selectedTerm.value) {
    resetDialogs();
    return;
  }
  if (terms.value.find((x) => x.name === selectedTerm.value.name)) {
    toasts.error('This term already exists.');
    return;
  }
  api
    .put(`/terms/${selectedTerm.value._id}`, selectedTerm.value)
    .then(() => {
      const index = terms.value.findIndex(
        (x) => x._id === selectedTerm.value._id,
      );
      terms.value[index] = selectedTerm.value;
      resetDialogs();
      toasts.success('Term updated.');
    })
    .catch(() => {
      toasts.error('Error editing term.');
    });
}

const removeDialog = ref(false);
function remove(index: number) {
  selectedTerm.value = { ...sortedTerms.value[index] };
  removeDialog.value = true;
}
function confirmRemove() {
  api
    .delete(`/terms/${selectedTerm.value._id}`)
    .then(() => {
      const index = terms.value.findIndex(
        (x) => x._id === selectedTerm.value._id,
      );
      terms.value.splice(index, 1);
      resetDialogs();
      toasts.success('Term deleted.');
    })
    .catch(() => {
      toasts.error('Error deleting term.');
    });
}

function resetDialogs() {
  addDialog.value = false;
  editDialog.value = false;
  removeDialog.value = false;
  selectedTerm.value = {} as Term;
}
</script>

<style scoped>
.table {
  width: 100%;
}

.no-data {
  background: #2d2d2d;
  color: white;
  text-align: center;
}
</style>
