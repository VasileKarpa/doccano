<template>
  <v-container>
    <!-- Grupo de botões com tamanho consistente -->
    <div class="d-flex align-center">
      <v-btn
        color="primary"
        class="custom-btn"
        min-width="180"
        height="40"
        :disabled="false"
        @click="$router.push(`/projects/${projectId}/perspective/add`)"
      >
        <span class="btn-content">
          <v-icon class="mr-2">mdi-plus</v-icon>
          <span>Create new Perspective</span>
        </span>
      </v-btn>

      <v-btn
        color="error"
        class="ml-4 custom-btn"
        min-width="180"
        height="40"
        :disabled="!selected.length"
        @click="openConfirmDialog"
      >
        <span class="btn-content">
          <v-icon class="mr-2">mdi-delete</v-icon>
          <span>Delete Perspective</span>
        </span>
      </v-btn>

      <v-btn
        color="info"
        class="ml-4 custom-btn"
        min-width="180"
        height="40"
        :disabled="selected.length !== 1"
        @click="openDetailsDialog"
      >
        <span class="btn-content">
          <v-icon class="mr-2">mdi-eye</v-icon>
          <span>View Details</span>
        </span>
      </v-btn>
    </div>

    <v-data-table
      v-if="perspectives && perspectives.length"
      v-model="selected"
      :headers="headers"
      :items="perspectives"
      item-value="id"
      show-select
      class="mt-4 elevation-1"
      :items-per-page="10"
      :footer-props="{
        'items-per-page-options': [5, 10, 15, 20],
        'items-per-page-text': 'Itens por página:'
      }"
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

    <!-- Para o aviso de erro -->
    <v-alert 
      v-if="error" 
      type="error" 
      dismissible 
      class="custom-alert error-alert"
      border="left"
      elevation="2"
      colored-border
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">mdi-alert-circle</v-icon>
        <span>{{ error }}</span>
      </div>
    </v-alert>

    <!-- Diálogo de confirmação -->
    <v-dialog v-model="confirmDialog" max-width="500">
      <v-card>
        <v-card-title class="headline d-flex align-center">
          <v-icon left color="error">mdi-delete</v-icon>
          Delete Confirmation
          <v-chip color="error" small class="ml-2">
            {{ selected.length }} item(s)
          </v-chip>
        </v-card-title>
        <v-card-text>
          <p class="mb-4">Are you sure you want to delete the following perspectives?</p>
          
          <div class="delete-list-container">
            <div 
              v-for="item in selected"
              :key="item.id"
              class="delete-list-item"
            >
              <div class="d-flex align-center">
                <v-icon color="error" class="mr-2">mdi-close-circle</v-icon>
                <div>
                  <div class="delete-item-name">{{ item.name }}</div>
                  <div class="delete-item-creator">Created by: {{ item.created_by }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Para o aviso de confirmação no diálogo -->
          <v-alert
            type="warning"
            class="custom-alert warning-alert mt-4"
            border="left"
            elevation="2"
            colored-border
          >
            <div class="d-flex align-center">
              <v-icon class="mr-3">mdi-alert</v-icon>
              <span>This action cannot be undone.</span>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="confirmDialog = false">
            Cancel
          </v-btn>
          <v-btn text color="primary" @click="deleteSelectedConfirmed">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo para exibir os detalhes da perspectiva -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card>
        <v-card-title class="headline d-flex align-center primary white--text">
          Perspective Details
        </v-card-title>
        <v-card-text>
          <div v-if="selectedPerspective" class="details-content">
            <div class="detail-item">
              <div class="detail-label">Name:</div>
              <div class="detail-value">{{ selectedPerspective.name }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Data Type:</div>
              <div class="detail-value">{{ selectedPerspective.data_type }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Created By:</div>
              <div class="detail-value">{{ selectedPerspective.created_by }}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Created At:</div>
              <div class="detail-value">{{ formatDate(selectedPerspective.created_at) }}</div>
            </div>

            <div 
              v-for="(description, index) in filteredDescriptions" 
              :key="index"
              class="detail-item"
            >
              <div class="detail-label">{{ description.label }}:</div>
              <div class="detail-value">{{ selectedPerspective[description.field] }}</div>
            </div>
          </div>
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
      confirmDialog: false,
      detailsDialog: false,
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
      ],
      error: null,
    };
  },
  computed: {
    descriptions() {
      return [
        { field: 'description', label: 'Etiquette 1' },
        { field: 'description_1', label: 'Etiquette 2' },
        { field: 'description_2', label: 'Etiquette 3' },
        { field: 'description_3', label: 'Etiquette 4' },
        { field: 'description_4', label: 'Etiquette 5' },
        { field: 'description_5', label: 'Etiquette 6' },
        { field: 'description_6', label: 'Etiquette 7' }
      ];
    },
    filteredDescriptions() {
      if (!this.selectedPerspective) return [];
      return this.descriptions.filter(desc => 
        this.selectedPerspective[desc.field] != null && 
        this.selectedPerspective[desc.field] !== ''
      );
    }
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
      console.log(">>> A obter perspetivas com projectId:", this.projectId);
      try {
        this.error = null;
        const response = await this.$repositories.perspective.getPerspectives(this.projectId);
        console.log(">>> Received data:", response);
        this.perspectives = response.results;
      } catch (error) {
        console.error("Error loading perspectives:", error);
        this.error = "See console for more details.";
      }
    },
    openConfirmDialog() {
      this.confirmDialog = true;
    },
    async deleteSelectedConfirmed() {
      try {
        for (const item of this.selected) {
          await this.$repositories.perspective.deletePerspective(this.projectId, item.id);
        }
        this.perspectives = this.perspectives.filter(
          (item) => !this.selected.some((sel) => sel.id === item.id)
        );
        this.selected = [];
        this.confirmDialog = false;
      } catch (error) {
        console.error("Error deleting perspective(s):", error);
        this.error = "See console for more details.";
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
        console.error("Error loading perspective details:", error);
        this.error = "See console for more details.";
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString();
    }
  },
};
</script>

<style scoped>
.custom-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 0 20px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.custom-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 0.95rem;
}

.details-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  animation: fadeIn 0.3s ease;
}

.detail-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  padding: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-label {
  min-width: 120px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  font-size: 0.875rem;
}

.detail-value {
  flex: 1;
  padding-left: 24px;
  color: rgba(0, 0, 0, 0.87);
  font-size: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.v-alert {
  margin-top: 16px !important;
  border-radius: 8px !important;
}

.empty-state {
  color: rgba(0, 0, 0, 0.38);
  font-style: italic;
  text-align: center;
  padding: 24px;
}

.custom-alert {
  margin: 16px 0 !important;
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.custom-alert.error-alert {
  background-color: #fff5f5 !important;
  border-left-color: #dc3545 !important;
}

.custom-alert.warning-alert {
  background-color: #fff8e6 !important;
  border-left-color: #ffc107 !important;
}

.custom-alert .v-icon {
  font-size: 20px;
}

.custom-alert:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.delete-list-container {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  max-height: 300px;
  overflow-y: auto;
}

.delete-list-item {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.delete-list-item:last-child {
  border-bottom: none;
}

.delete-list-item:hover {
  background-color: #fff;
  transform: translateX(4px);
}

.delete-item-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.95rem;
}

.delete-item-creator {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.v-data-table ::v-deep .v-data-table__wrapper {
  border-radius: 8px;
}

.v-data-table ::v-deep table {
  border-collapse: separate;
  border-spacing: 0;
}

.v-data-table ::v-deep tbody tr {
  transition: all 0.3s ease;
}

.v-data-table ::v-deep tbody tr:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.v-data-table ::v-deep .v-data-table-header {
  background-color: #f8f9fa;
}

.v-data-table ::v-deep th {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.v-data-table ::v-deep td {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.v-data-table ::v-deep .v-data-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 24px;
}

.v-data-table ::v-deep .v-data-footer__select {
  margin-right: 24px;
}

.v-data-table ::v-deep .v-data-footer__pagination {
  margin-left: 24px;
}

.v-data-table ::v-deep .v-pagination__item {
  min-width: 32px;
  height: 32px;
  margin: 0 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.v-data-table ::v-deep .v-pagination__item--active {
  background-color: #1976d2;
  color: white;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}

.v-data-table ::v-deep .v-pagination__item:hover {
  background-color: #e3f2fd;
  transform: translateY(-1px);
}

.v-toolbar {
  background-color: #f8f9fa !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.v-toolbar-title {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
}
</style>
