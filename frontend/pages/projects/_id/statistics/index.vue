<template>
  <v-container>
    <!-- Page title -->
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Statisticzzzzz</h1>
      </v-col>
    </v-row>

    <!-- Selector buttons just under the title -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex">
        <v-btn
          :color="activeSection === 'annotations' ? 'primary' : 'grey lighten-1'"
          class="mr-3"
          depressed
          @click="toggleSection('annotations')"
        >
          Annotations
        </v-btn>

        <v-btn
          :color="activeSection === 'annotators' ? 'primary' : 'grey lighten-1'"
          depressed
          @click="toggleSection('annotators')"
        >
          Annotators
        </v-btn>
      </v-col>
    </v-row>

    <!-- ============================  ANNOTATIONS SECTION  ============================ -->
    <v-expand-transition>
      <div v-if="activeSection === 'annotations'">
        <!-- Sub-report type (Desacordos | Perspetivas)  -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedReport"
              :items="annotationReportTypes"
              label="Tipo de Relatório"
              outlined
              dense
              @change="onReportTypeChange"
            />
          </v-col>
        </v-row>

        <!-- Annotation-specific filters -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-if="showDatasetFilter"
              v-model="selectedDataset"
              :items="datasets"
              item-text="name"
              item-value="id"
              label="Dataset"
              outlined
              dense
              :loading="loadingDatasets"
            />

            <v-select
              v-else-if="showPerspectiveFilter"
              v-model="selectedPerspective"
              :items="perspectives"
              item-text="name"
              item-value="id"
              label="Perspetiva"
              outlined
              dense
              :loading="loadingPerspectives"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-if="showDiscussionFilter"
              v-model="selectedDiscussion"
              :items="discussions"
              item-text="title"
              item-value="id"
              label="Título da Discussão"
              outlined
              dense
              :loading="loadingDiscussions"
            />
          </v-col>
        </v-row>

        <!-- Action buttons -->
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              class="mr-2"
              :loading="loading"
              :disabled="!canGenerateReport"
              @click="generateReport"
            >
              Gerar Relatório
            </v-btn>

            <v-btn
              color="secondary"
              :disabled="!reportData"
              @click="exportReport"
            >
              Exportar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Report table(s) for annotations -->
        <v-row v-if="reportData && (selectedReport === 'disagreements' || selectedReport === 'perspectives')">
          <v-col cols="12">
            <v-card>
              <v-card-title>{{ reportTitle }}</v-card-title>
              <v-card-text>
                <div v-if="selectedReport === 'disagreements'">
                  <v-data-table
                    :headers="disagreementHeaders"
                    :items="reportData.items"
                    :loading="loading"
                  />
                </div>
                <div v-else-if="selectedReport === 'perspectives'">
                  <v-data-table
                    :headers="perspectiveHeaders"
                    :items="reportData.items"
                    :loading="loading"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <!-- ============================  ANNOTATORS SECTION  ============================ -->
    <v-expand-transition>
      <div v-if="activeSection === 'annotators'">
        <!-- Filters -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedMember"
              :items="members"
              item-text="username"
              item-value="id"
              label="Anotador"
              outlined
              dense
              :loading="loadingMembers"
            />
          </v-col>
        </v-row>

        <!-- Action buttons -->
        <v-row>
          <v-col cols="12">
            <v-btn
              color="primary"
              class="mr-2"
              :loading="loading"
              :disabled="!canGenerateReport"
              @click="generateReport"
            >
              Gerar Relatório
            </v-btn>

            <v-btn
              color="secondary"
              :disabled="!reportData"
              @click="exportReport"
            >
              Exportar
            </v-btn>
          </v-col>
        </v-row>

        <!-- Report table for annotators -->
        <v-row v-if="reportData && selectedReport === 'annotators'">
          <v-col cols="12">
            <v-card>
              <v-card-title>{{ reportTitle }}</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="annotatorHeaders"
                  :items="reportData.items"
                  :loading="loading"
                >
                  <template v-slot:[`item.datasets`]="{ item }">
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="dataset in item.datasets"
                        :key="dataset.document"
                      >
                        <v-expansion-panel-header>
                          Dataset #{{ dataset.document }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-simple-table dense>
                            <thead>
                              <tr>
                                <th>Label</th>
                                <th class="text-right">Count</th>
                                <th class="text-right">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="category in dataset.categories" :key="category.name">
                                <td>
                                  <v-chip
                                    :color="getLabelColor(category.name)"
                                    :text-color="getLabelTextColor(category.name)"
                                    small
                                    class="me-1"
                                  >
                                    {{ category.name }}
                                  </v-chip>
                                </td>
                                <td class="text-right">{{ category.count }}</td>
                                <td class="text-right">{{ category.percentage }}%</td>
                              </tr>
                            </tbody>
                          </v-simple-table>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>

    <!-- ============================  ERROR ============================ -->
    <v-row v-if="error">
      <v-col cols="12">
        <v-alert type="error" border="left" colored-border elevation="2">
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Perspective } from '~/domain/models/perspective/perspective'
import { Member } from '~/domain/models/member/member'
import { StatisticsRepository } from '~/domain/repositories/statistics/statisticsRepositoryInterface'

interface ReportData {
  items: Array<{
    document?: number
    annotator1?: number
    annotator2?: number
    disagreementRate?: number
    disagreementCategories?: string[]
    perspective?: string
    total?: number
    categories?: string
    datasets?: Array<{
      document: number
      categories: Array<{
        name: string
        count: number
        percentage: string
      }>
    }>
  }>
}

interface Dataset {
  id: number
  name: string
}

interface Discussion {
  id: number
  title: string
}

interface LabelItem {
  text: string
  backgroundColor: string
  textColor: string
}

export default Vue.extend({
  layout: 'project',
  middleware: ['check-auth', 'auth', 'setCurrentProject'],

  validate({ params }) {
    return /^\d+$/.test(params.id)
  },

  data() {
    return {
      activeSection: null as 'annotations' | 'annotators' | null,
      annotationReportTypes: [
        { text: 'Relatório de Desacordos', value: 'disagreements' },
        { text: 'Relatório de Perspetivas', value: 'perspectives' }
      ],
      selectedReport: 'disagreements',
      selectedDataset: null as number | null,
      selectedPerspective: null as number | null,
      selectedMember: null as number | null,
      selectedDiscussion: null as number | null,
      loading: false,
      loadingDatasets: false,
      loadingPerspectives: false,
      loadingMembers: false,
      loadingDiscussions: false,
      reportData: null as ReportData | null,
      reportTypes: [
        { text: 'Relatório de Desacordos', value: 'disagreements' },
        { text: 'Relatório de Perspetivas', value: 'perspectives' },
        { text: 'Relatório de Anotadores', value: 'annotators' }
      ],
      datasets: [] as Dataset[],
      perspectives: [] as Perspective[],
      members: [] as Member[],
      discussions: [] as Discussion[],
      disagreementHeaders: [
        { text: 'Documento', value: 'document' },
        { text: 'Anotador 1', value: 'annotator1' },
        { text: 'Anotador 2', value: 'annotator2' },
        { text: 'Taxa de Desacordo', value: 'disagreementRate' },
        { text: 'Categorias em Desacordo', value: 'disagreementCategories' }
      ],
      perspectiveHeaders: [
        { text: 'Documento', value: 'document' },
        { text: 'Anotador', value: 'annotator' },
        { text: 'Categoria', value: 'category' },
        { text: 'Frequência', value: 'frequency' },
        { text: 'Percentagem', value: 'percentage' }
      ],
      annotatorHeaders: [
        { text: 'Anotador', value: 'annotator' },
        { text: 'Total de Anotações', value: 'total' },
        { text: 'Categorias Usadas', value: 'categories' },
        { text: 'Taxa de Desacordo', value: 'disagreementRate' }
      ],
      headers: [
        { text: 'Annotator', value: 'annotator' },
        { text: 'Total Annotations', value: 'total' },
        { text: 'Categories', value: 'categories' },
        { text: 'Datasets', value: 'datasets' }
      ],
      labels: [] as LabelItem[],
      projectId: 0,
      error: null as string | null
    }
  },

  computed: {
    showDatasetFilter(): boolean {
      return this.selectedReport === 'disagreements'
    },
    showPerspectiveFilter(): boolean {
      return this.selectedReport === 'perspectives'
    },
    showMemberFilter(): boolean {
      return this.selectedReport === 'annotators'
    },
    showDiscussionFilter(): boolean {
      return this.selectedReport === 'disagreements' && this.selectedDataset !== null
    },
    canGenerateReport(): boolean {
      switch (this.selectedReport) {
        case 'disagreements':
          return this.selectedDataset !== null && this.selectedDiscussion !== null
        case 'perspectives':
          return this.selectedPerspective !== null
        case 'annotators':
          return this.selectedMember !== null
        default:
          return false
      }
    },
    reportTitle(): string {
      const map: Record<string, string> = {
        disagreements: 'Relatório de Desacordos',
        perspectives: 'Relatório de Perspetivas',
        annotators: 'Relatório de Anotadores'
      }
      return map[this.selectedReport] || ''
    }
  },

  async fetch() {
    await this.loadInitialData()
  },

  methods: {
    /* Toggle the two main sections */
    toggleSection(section: 'annotations' | 'annotators') {
      // If the user clicks the already‑open section, collapse it
      if (this.activeSection === section) {
        this.activeSection = null
        return
      }

      // Open the requested section and set an appropriate default reportType
      this.activeSection = section
      this.selectedReport = section === 'annotators' ? 'annotators' : 'disagreements'
      this.onReportTypeChange()
    },

    async loadInitialData() {
      const projectId = parseInt(this.$route.params.id)
      await Promise.all([
        this.loadDatasets(projectId),
        this.loadPerspectives(projectId),
        this.loadMembers(projectId)
      ])
    },

    async loadDatasets(_projectId: number) {
      this.loadingDatasets = true
      try {
        // TODO: Implementar chamada à API para obter datasets
        const response = await new Promise<{ results: Dataset[] }>(resolve => {
          setTimeout(() => {
            resolve({
              results: [
                { id: 1, name: 'Dataset 1' },
                { id: 2, name: 'Dataset 2' }
              ]
            })
          }, 1000)
        })
        this.datasets = response.results
      } catch (error) {
        console.error('Erro ao carregar datasets:', error)
      } finally {
        this.loadingDatasets = false
      }
    },

    async loadPerspectives(projectId: number) {
      this.loadingPerspectives = true
      try {
        this.perspectives = await this.$repositories.perspective.getPerspectives(projectId)
      } catch (error) {
        console.error('Erro ao carregar perspetivas:', error)
      } finally {
        this.loadingPerspectives = false
      }
    },

    async loadMembers(projectId: number) {
      this.loadingMembers = true
      try {
        const response = await this.$repositories.metrics.fetchCategoryDistribution(projectId.toString(), {})
        this.members = Object.keys(response).map(username => ({
          id: username,
          username,
          email: '',
          role: 'annotator',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      } catch (error) {
        console.error('Erro ao carregar membros:', error)
      } finally {
        this.loadingMembers = false
      }
    },

    async loadDiscussions(_projectId: number, _datasetId: number) {
      this.loadingDiscussions = true
      try {
        // TODO: Implementar chamada à API para obter discussões
        const response = await new Promise<{ results: Discussion[] }>(resolve => {
          setTimeout(() => {
            resolve({
              results: [
                { id: 1, title: 'Discussão 1' },
                { id: 2, title: 'Discussão 2' }
              ]
            })
          }, 1000)
        })
        this.discussions = response.results
      } catch (error) {
        console.error('Erro ao carregar discussões:', error)
      } finally {
        this.loadingDiscussions = false
      }
    },

    onReportTypeChange() {
      // Resetar seleções quando o tipo de relatório muda
      this.selectedDataset = null
      this.selectedPerspective = null
      this.selectedMember = null
      this.selectedDiscussion = null
      this.reportData = null
    },

    async generateReport() {
      try {
        this.loading = true
        this.error = null
        const projectId = parseInt(this.$route.params.id)
        const statisticsRepository = this.$repositories.statistics as StatisticsRepository

        const filters = {
          dataset: this.selectedDataset || undefined,
          discussion: this.selectedDiscussion || undefined,
          perspective: this.selectedPerspective || undefined,
          member: this.selectedMember || undefined
        }

        console.log('Generating report with filters:', filters)

        let reportData
        try {
          switch (this.selectedReport) {
            case 'disagreements':
              reportData = await statisticsRepository.generateDisagreementReport(projectId, filters)
              break
            case 'perspectives':
              reportData = await statisticsRepository.generatePerspectiveReport(projectId, filters)
              break
            case 'annotators':
              reportData = await statisticsRepository.generateAnnotatorReport(projectId, filters)
              break
          }
        } catch (apiError: any) {
          console.error('API Error details:', {
            status: apiError.response?.status,
            data: apiError.response?.data,
            headers: apiError.response?.headers
          })

          if (apiError.response?.status === 500) {
            this.error = 'O servidor encontrou um erro ao processar sua solicitação. Por favor, tente novamente mais tarde ou entre em contato com o administrador.'
          } else if (apiError.response?.status === 404) {
            this.error = 'Os dados solicitados não foram encontrados. Verifique se o membro selecionado possui anotações.'
          } else {
            this.error = apiError.response?.data?.detail || apiError.message || 'Erro ao gerar relatório'
          }
          this.reportData = null
          return
        }

        if (!reportData || !reportData.items || reportData.items.length === 0) {
          this.error = 'Nenhum dado encontrado para os filtros selecionados.'
          this.reportData = null
          return
        }

        this.reportData = reportData
      } catch (error: any) {
        console.error('Error generating report:', error)
        this.error = error.response?.data?.detail || error.message || 'Erro ao gerar relatório'
        this.reportData = null
      } finally {
        this.loading = false
      }
    },

    async exportReport() {
      try {
        const statisticsRepository = this.$repositories.statistics as StatisticsRepository
        await statisticsRepository.exportReport(
          this.reportData,
          'csv'
        )
      } catch (error) {
        console.error('Erro ao exportar relatório:', error)
      }
    },

    getLabelColor(labelName: string): string {
      const label = this.labels.find(l => l.text === labelName)
      return label?.backgroundColor || '#ccc'
    },
    getLabelTextColor(labelName: string): string {
      const label = this.labels.find(l => l.text === labelName)
      return label?.textColor || '#000'
    },
    async loadLabels() {
      try {
        const response = await this.$services.categoryType.list(this.$route.params.id)
        this.labels = response.map((item: any) => ({
          text: item.text,
          backgroundColor: item.backgroundColor,
          textColor: item.textColor
        }))
      } catch (error) {
        console.error('Error loading labels:', error)
        this.error = 'Failed to load labels'
      }
    }
  },

  async created() {
    await this.loadLabels()
    await this.loadInitialData()
  }
})
</script>