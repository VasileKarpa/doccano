<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      :options.sync="options"
      :server-items-length="total"
      :search="search"
      :loading="isLoading"
      item-key="id"
      show-select
      class="elevation-1"
      @input="$emit('input', $event)"
      @update:options="updateQuery({ query: $route.query })"
    >
      <template #top>
        <v-text-field
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          label="Pesquisar"
          single-line
          hide-details
          filled
          @input="emitSearch"
        />
      </template>

      <template #[`item.username`]="{ item }">
        <v-btn icon small @click="showDetails(item)" title="Ver detalhes">
          <v-icon>{{ mdiChevronDown }}</v-icon>
        </v-btn>
        {{ item.username }}
      </template>

      <template #[`item.isStaff`]="{ item }">
        {{ item.isStaff }}
      </template>

      <template #[`item.isSuperuser`]="{ item }">
        {{ item.isSuperuser }}
      </template>

      <template #[`item.actions`]="{ item }">
        <v-icon small @click="showDetails(item)" color="primary" class="cursor-pointer" title="Ver detalhes">
          mdi-eye
        </v-icon>
      </template>
    </v-data-table>

    <v-dialog v-model="showDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left color="deep-purple accent-4">mdi-account-circle</v-icon>
          Edit User
        </v-card-title>
        <v-card-text v-if="selectedUser">
          <v-text-field v-model="selectedUser.username" label="Username" />
          <v-text-field v-model="selectedUser.firstName" label="Primeiro Nome" />
          <v-text-field v-model="selectedUser.lastName" label="Último Nome" />
          <v-text-field v-model="selectedUser.email" label="Email" />
          <v-switch v-model="selectedUser.isStaff" label="Staff" />
          <v-switch v-model="selectedUser.isSuperuser" label="Superuser" />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="saveUser">Salvar</v-btn>
          <v-btn color="primary" text @click="showDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { mdiMagnify, mdiChevronDown } from '@mdi/js'
import type { PropType } from 'vue'
import Vue from 'vue'
import { DataOptions } from 'vuetify/types'
import { UserItem } from '~/domain/models/user'

export default Vue.extend({
  props: {
    isLoading: {
      type: Boolean,
      required: true
    },
    items: {
      type: Array as PropType<UserItem[]>,
      required: true
    },
    value: {
      type: Array as PropType<UserItem[]>,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      search: this.$route.query.q || '',
      options: {} as DataOptions,
      mdiMagnify,
      mdiChevronDown,
      showDialog: false,
      selectedUser: null as UserItem | null
    }
  },
  computed: {
    headers() {
      return [
        { text: 'Username', value: 'username', sortable: true },
        { text: 'First_name', value: 'firstName' },
        { text: 'Last_name', value: 'lastName' },
        { text: 'Staff', value: 'isStaff' },
        { text: 'Superuser', value: 'isSuperuser' },
        { text: 'Active', value: 'isActive' },
      ]
    }
  },
  watch: {
    search() {
      this.emitSearch()
    }
  },
  methods: {
    emitSearch() {
      this.$emit('search', this.search)
    },
    updateQuery(payload: any) {
      const { sortBy, sortDesc } = this.options
      const query = {
        ...payload.query,
        sortBy: sortBy?.[0] || '',
        sortDesc: sortDesc?.[0] || false,
        q: this.search
      }
      this.$emit('update:query', { query })
    },
    showDetails(user: UserItem) {
      this.selectedUser = { ...user }
      this.showDialog = true
    },
    saveUser() {
      this.$emit('update-user', this.selectedUser)
      this.showDialog = false
    }
  }
})
</script>
