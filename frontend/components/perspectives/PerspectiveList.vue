<template>
  <v-container>
    <v-btn color="primary" @click="$router.push(`/projects/${projectId}/perspective/add`)">
      Create new Perspective
    </v-btn>

    <!-- Botão para excluir as perspectivas selecionadas -->
    <v-btn color="error" class="ml-2" @click="openConfirmDialog" :disabled="!selected.length">
      Delete Perspective
    </v-btn>

    <!-- Botão para consultar os detalhes da perspectiva selecionada -->
    <v-btn color="info" class="ml-2" @click="openDetailsDialog" :disabled="selected.length !== 1">
      View Details
    </v-btn>

    <v-data-table
      v-if="perspectives && perspectives.length"
      :headers="headers"
      :items="perspectives"
      item-value="id"
      show-select
      v-model="selected"
      class="mt-4"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Perspetivas</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>
    </v-data-table>

    <div v-else class="mt-4">
      <p>No perspective has been found.</p>
    </div>

    <v-alert v-if="error" type="error" dismissible class="mt-4">
      {{ error }}
    </v-alert>

    <!-- Diálogo de confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirmação</v-card-title>
        <v-card-text>
          Are you sure you want to delete the selected perspective?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="confirmDialog = false">
            Cancel
          </v-btn>
          <v-btn text color="error" @click="deleteSelectedConfirmed">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para exibir os detalhes da perspectiva -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card>
        <v-card-title class="headline">Perspective Details</v-card-title>
        <v-card-text>
          <p><strong>Name:</strong> {{ selectedPerspective?.name }}</p>
          <p><strong>Data Type:</strong> {{ selectedPerspective?.data_type }}</p>
          <p><strong>Description:</strong> {{ selectedPerspective?.description }}</p>
          <p><strong>Created By:</strong> {{ selectedPerspective?.created_by }}</p>
          <p><strong>Created At:</strong> {{ selectedPerspective?.created_at }}</p>
          <p><strong>Project ID:</strong> {{ selectedPerspective?.project_id }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      projectId: null,
      perspectives: [],
      selected: [], // Perspectivas selecionadas
      confirmDialog: false, // Controla a visibilidade do diálogo
      detailsDialog: false, // Controla a visibilidade do diálogo de detalhes
      selectedPerspective: null, // Armazena os detalhes da perspectiva selecionada
      headers: [
        { text: "Name", value: "name" },
        { text: "Created By", value: "created_by" },
        { text: "Description", value: "description", sortable: false },
      ],
      error: null,
    };
  },
  async mounted() {
    this.projectId = this.$route.params.id;
    if (!this.projectId) {
      this.error = "Project ID not found";
      return;
    }
    await this.fetchPerspectives();
  },
  methods: {
    async fetchPerspectives() {
      console.log(">>> Chamando getPerspectives com projectId:", this.projectId);
      try {
        this.error = null;
        const response = await this.$repositories.perspective.getPerspectives(this.projectId);
        console.log(">>> Dados recebidos:", response);
        this.perspectives = response.results;
      } catch (error) {
        console.error("Erro ao carregar perspetivas:", error);
        this.error = "Erro ao carregar perspetivas. Veja o console para mais detalhes.";
      }
    },
    openConfirmDialog() {
      this.confirmDialog = true;
    },
    async deleteSelectedConfirmed() {
      try {
        // Chama a função de deleção para cada perspectiva selecionada
        for (const item of this.selected) {
          await this.$repositories.perspective.deletePerspective(this.projectId, item.id);
        }
        // Atualiza a lista removendo os itens deletados
        this.perspectives = this.perspectives.filter(
          (item) => !this.selected.some((sel) => sel.id === item.id)
        );
        // Limpa a seleção e fecha o diálogo
        this.selected = [];
        this.confirmDialog = false;
      } catch (error) {
        console.error("Erro ao excluir perspetiva(s):", error);
        this.error = "Erro ao excluir perspetiva(s). Veja o console para mais detalhes.";
        this.confirmDialog = false;
      }
    },
    async openDetailsDialog() {
      try {
        if (this.selected.length === 1) {
          const perspectiveId = this.selected[0].id;
          this.selectedPerspective = await this.$repositories.perspective.getPerspectiveDetails(
            this.projectId,
            perspectiveId
          );
          this.detailsDialog = true;
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes da perspectiva:", error);
        this.error = "Erro ao carregar detalhes da perspectiva. Veja o console para mais detalhes.";
      }
    },
  },
};
</script>
