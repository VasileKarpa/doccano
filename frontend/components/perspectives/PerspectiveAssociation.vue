<template>
  <div>
    <h5 class="mt-4">Perspetivas Associadas</h5>
    <v-select
      :items="perspectives"
      item-text="name"
      item-value="id"
      label="Associar perspetiva"
      v-model="selectedPerspective"
    />
    <v-btn color="primary" class="mt-2" @click="associatePerspective">Associar</v-btn>
    <v-list two-line subheader>
      <v-list-item v-for="association in associations" :key="association.id">
        <v-list-item-content>{{ association.perspective }}</v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="remove(association.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { usePerspective } from '@/composables/usePerspective'

export default {
  props: {
    contentTypeId: { type: Number, required: true },
    annotationId: { type: Number, required: true }
  },
  setup(props) {
    const selectedPerspective = ref(null)
    const {
      perspectives,
      associations,
      fetchPerspectives,
      fetchAssociations,
      associate,
      removeAssociation
    } = usePerspective()

    onMounted(() => {
      fetchPerspectives()
      fetchAssociations(props.annotationId)
    })

    const associatePerspective = async () => {
      if (selectedPerspective.value) {
        await associate(props.contentTypeId, props.annotationId, selectedPerspective.value)
        selectedPerspective.value = null
      }
    }

    const remove = async (associationId: number) => {
      await removeAssociation(associationId, props.annotationId)
    }

    return {
      selectedPerspective,
      perspectives,
      associations,
      associatePerspective,
      remove
    }
  }
}
</script>
