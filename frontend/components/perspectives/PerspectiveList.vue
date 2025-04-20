<template>
  <v-container>
    <!-- Botão para criar nova perspectiva -->
    <v-btn
      :disabled="!projectId"
      color="primary"
      @click="$router.push(`/projects/${projectId}/perspective/add`)"
    >
      Create new Perspective
    </v-btn>

    <!-- Botão para gerenciar anotadores -->
    <v-btn
      :disabled="!projectId"
      color="secondary"
      class="ml-2"
      @click="openAnnotatorManager"
    >
      Manage Annotators
    </v-btn>

    <!-- Botão para excluir as perspectivas selecionadas -->
    <v-btn
      :disabled="!selected.length"
      color="error"
      class="ml-2"
      @click="openConfirmDialog"
    >
      Delete Perspective
    </v-btn>

    <!-- Botão para consultar os detalhes da perspectiva selecionada -->
    <v-btn
      :disabled="selected.length !== 1"
      color="info"
      class="ml-2"
      @click="openDetailsDialog"
    >
      View Details
    </v-btn>

    <!-- Tabela de perspectivas -->
    <v-data-table
      v-model="selected"
      :items="perspectives"
      :headers="headers"
      item-value="id"
      show-select
      class="mt-4"
    >
      <!-- Toolbar (parte superior da tabela) -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Perspectives</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
      </template>

      <!-- Slot para a ação personalizada -->
      <template v-slot:items="props">
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.created_by }}</td>
        <td>{{ props.item.description }}</td>
        <td>
          <v-btn color="success" small @click="openAnnotatorDialog(props.item)">
            Associate Annotator
          </v-btn>
        </td>
      </template>
    </v-data-table>

    <!-- Mensagem quando a lista estiver vazia -->
    <div v-if="perspectives.length === 0" class="mt-4">
      <p>No perspective has been found.</p>
    </div>

    <!-- Alertas de erro -->
    <v-alert v-if="error" type="error" dismissible class="mt-4">
      {{ error }}
    </v-alert>

    <!-- Diálogo para gerenciar anotadores -->
    <v-dialog v-model="annotatorManagerDialog" max-width="800">
      <v-card>
        <v-card-title class="headline">Manage Annotators</v-card-title>
        <v-card-text>
          <p>Select the perspectives you want to associate with the annotator:</p>
          <v-data-table
            v-model="selectedAnnotatorPerspectives"
            :items="perspectives"
            :headers="annotatorHeaders"
            multiple
            item-value="id"
            dense
            class="mt-4"
            show-select
          >
            <!-- Tabela que exibe perspectivas -->
            <template v-slot:items="props">
              <td>{{ props.item.name }}</td>
              <td>{{ props.item.created_by }}</td>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="closeAnnotatorManager">Cancel</v-btn>
          <v-btn text color="primary" @click="saveAnnotatorAssociations">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Confirmation</v-card-title>
        <v-card-text>
          Are you sure you want to delete the selected perspectives?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="confirmDialog = false">Cancel</v-btn>
          <v-btn text color="primary" @click="deleteSelectedConfirmed">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para exibir os detalhes -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card>
        <v-card-title class="headline">Perspective Details</v-card-title>
        <v-card-text>
          <p><strong>Name:</strong> {{ selectedPerspective?.name }}</p>
          <p><strong>Data Type:</strong> {{ selectedPerspective?.data_type }}</p>
          <p><strong>Created By:</strong> {{ selectedPerspective?.created_by }}</p>
          <p><strong>Created At:</strong> {{ selectedPerspective?.created_at }}</p>
          <p><strong>Etiquette 1:</strong> {{ selectedPerspective?.description }}</p>
          <p><strong>Etiquette 2:</strong> {{ selectedPerspective?.description_1 }}</p>
          <p><strong>Etiquette 3:</strong> {{ selectedPerspective?.description_2 }}</p>
          <p><strong>Etiquette 4:</strong> {{ selectedPerspective?.description_3 }}</p>
          <p><strong>Etiquette 5:</strong> {{ selectedPerspective?.description_4 }}</p>
          <p><strong>Etiquette 6:</strong> {{ selectedPerspective?.description_5 }}</p>
          <p><strong>Etiquette 7:</strong> {{ selectedPerspective?.description_6 }}</p>
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
      selected: [],
      selectedAnnotatorPerspectives: [],
      confirmDialog: false,
      detailsDialog: false,
      annotatorManagerDialog: false,
      selectedPerspective: null,
      headers: [
        { text: "Name", value: "name" },
        { text: "Created By", value: "created_by" },
        { text: "Etiquette 1", value: "description", sortable: false },
        { text: "Etiquette 2", value: "description_1", sortable: false },
        { text: "Etiquette 3", value: "description_2", sortable: false },
        { text: "Etiquette 4", value: "description_3", sortable: false },
        { text: "Etiquette 5", value: "description_4", sortable: false },
        { text: "Etiquette 6", value: "description_5", sortable: false },
        { text: "Etiquette 7", value: "description_6", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      annotatorHeaders: [
        { text: "Name", value: "name" },
        { text: "Created By", value: "created_by" },
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
      try {
        this.error = null;
        const response = await this.$repositories.perspective.getPerspectives(this.projectId);
        this.perspectives = response.results;
      } catch (error) {
        console.error("Erro ao carregar perspectivas:", error);
        this.error = "Erro ao carregar perspectivas. Veja o console para mais detalhes.";
      }
    },

    openAnnotatorManager() {
      this.annotatorManagerDialog = true;
    },

    closeAnnotatorManager() {
      this.annotatorManagerDialog = false;
    },

   async saveAnnotatorAssociations() {
    if (!this.projectId || !this.selectedAnnotatorPerspectives.length) {
      this.error = "Selecione pelo menos uma perspectiva para associar.";
      return;
    }

    if (!this.selectedAnnotatorId) {
      this.error = "Selecione um anotador para associar às perspectivas.";
      return;
    }

    try {
      this.error = null;

      for (const perspectiveId of this.selectedAnnotatorPerspectives) {
        console.debug(
          `Associando anotador ${this.selectedAnnotatorId} à perspectiva ${perspectiveId}`
        );

        await this.$apiPerspectiveRepository.associateAnnotatorToPerspective(
          this.projectId,
          perspectiveId,
          this.selectedAnnotatorId
        );
      }

      this.$toast.success("As perspectivas foram associadas com sucesso!");
      this.annotatorManagerDialog = false;
      this.loadPerspectives();
    } catch (err) {
      console.error("Erro ao associar perspectivas:", err.response ?? err);

      if (err.response && err.response.data && err.response.data.detail) {
        this.error = `Erro do servidor: ${err.response.data.detail}`;
      } else {
        this.error =
          "Ocorreu um erro ao associar as perspectivas. Verifique os dados e tente novamente.";
      }
    }
  },





    openConfirmDialog() {
      this.confirmDialog = true;
    },

    async deleteSelectedConfirmed() {
      try {
        for (const perspective of this.selected) {
          await this.$repositories.perspective.deletePerspective(this.projectId, perspective.id);
        }
        this.perspectives = this.perspectives.filter(item => !this.selected.includes(item));
        this.selected = [];
        this.confirmDialog = false;
      } catch (error) {
        console.error("Erro ao excluir perspectivas:", error);
        this.error = "Erro ao excluir perspectivas. Verifique o console.";
      }
    },

    openDetailsDialog() {
      if (this.selected.length === 1) {
        this.selectedPerspective = this.selected[0];
        this.detailsDialog = true;
      }
    },
  },
};
</script>