<!-- pages/projects/_id/annotations-comparator/index.vue -->
<template>
  <v-card>
    <v-card-title>
      Annotations Comparator
      <v-spacer/>
      <v-progress-circular v-if="isLoading" indeterminate size="20"/>
    </v-card-title>

    <v-container fluid>
      <v-alert
        v-if="!examples.length && !isLoading"
        type="info"
        border="left"
        colored-border
        elevation="1"
      >
        {{ $t('vuetify.noDataAvailable') }}
      </v-alert>

      <!-- ─────── 1 card por example ──────────────────────────────── -->
      <v-card
        v-for="ex in examples"
        :key="ex.id"
        class="mb-4 pa-3"
        outlined
      >
        <!-- texto do dataset -->
        <div class="font-weight-medium mb-2">{{ ex.text }}</div>

        <!-- tabela membro → chips ----------------------------------- -->
        <v-simple-table dense>
          <thead>
            <tr>
              <th class="py-1 pr-2 text-no-wrap">Members</th>
              <th class="py-1">Labels</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in ex.userLabels" :key="row.username">
              <td class="py-1 pr-2 text-no-wrap">{{ row.username }}</td>
              <td class="py-1">
                <v-chip
                  v-for="lab in row.labels"
                  :key="lab.text"
                  small
                  :color="lab.color"
                  :text-color="$contrastColor(lab.color)"
                  class="ma-1"
                >
                  {{ lab.text }}
                </v-chip>
              </td>
            </tr>
          </tbody>
        </v-simple-table>

        <!-- gráfico de barras --------------------------------------- -->
        <v-row v-if="ex.chart.labels.length" dense class="mt-2">
          <v-col>
            <v-sparkline
              :value="ex.chart.counts"
              :labels="ex.chart.labels"
              type="bar"
              height="60"
              auto-draw
              :gradient="ex.chart.colors"
            />
            <div class="d-flex flex-wrap mt-1">
              <div
                v-for="(lbl, idx) in ex.chart.labels"
                :key="lbl"
                class="caption me-4"
              >
                <span
                  :style="{background: ex.chart.colors[idx]} "
                  class="legend-dot me-1"
                />
                {{ lbl }} ({{ ex.chart.counts[idx] }})
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { ExampleDTO } from '~/services/application/example/exampleData'
import { LabelItem } from '~/domain/models/label/label'

export default Vue.extend({
  layout: 'project',
  middleware: ['check-auth', 'auth', 'setCurrentProject'],

  validate ({ params }) { return /^\d+$/.test(params.id) },

  data () {
    return {
      isLoading: false,
      examples : [] as any[],             // enriquecido com chart
      labels   : [] as LabelItem[]
    }
  },

  computed: {
    ...mapGetters('projects', ['project']),
    projectId (): string { return this.$route.params.id }
  },

  async fetch () {
    this.isLoading = true
    try {
      /* 1) exemplos + meta-labels */
      const list = await this.$services.example.list(this.projectId, {})
      this.labels = await this.$services.categoryType.list(this.projectId)

      /* 2) enriquecer cada example com userLabels + dados p/ gráfico */
      const enr = await Promise.all(
        list.items.map(async (ex: ExampleDTO) => {
          try {
            /* distribuição por membro */
            const dist = await this.$repositories.metrics
              .fetchCategoryDistribution(this.projectId, { example: ex.id })

            // ---- tabela membro → chips ---------------------------------
            const rows = Object.entries(dist).map(([username, lblCounts]: [string, Record<string, number>]) => {
              const lbls = Object.entries(lblCounts)
                .filter(([, c]) => c > 0)
                .map(([text]) => {
                  const meta = this.labels.find(l => l.text === text)
                  return { 
                    text, 
                    color: meta?.backgroundColor || '#E0E0E0' 
                  }
                })
              return { username, labels: lbls }
            })

            // ---- dados para grafico  -----------------------------------
            const total = Object.entries(dist).reduce((acc: Record<string, number>, [, l]) => {
              for (const [t, c] of Object.entries(l)) acc[t] = (acc[t] || 0) + c
              return acc
            }, {})

            const chartLabels = Object.keys(total)
            const chartCounts = chartLabels.map(l => total[l])
            const chartColors = chartLabels.map(l => {
              const meta = this.labels.find(x => x.text === l)
              return meta?.backgroundColor || '#90CAF9'
            })

            return {
              ...ex,
              userLabels: rows,
              chart: { labels: chartLabels, counts: chartCounts, colors: chartColors }
            }
          } catch (error) {
            console.error(`Error processing example ${ex.id}:`, error)
            return {
              ...ex,
              userLabels: [],
              chart: { labels: [], counts: [], colors: [] }
            }
          }
        })
      )

      this.examples = enr
    } catch (error) {
      console.error('Error loading annotations comparator:', error)
      this.examples = []
    } finally {
      this.isLoading = false
    }
  }
})
</script>

<style scoped>
.legend-dot{
  display:inline-block;
  width:10px; height:10px;
  border-radius:50%;
}
</style>
