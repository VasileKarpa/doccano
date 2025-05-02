<template>
  <v-list dense>
    <!-- botão “Start annotation” --------------------------------------->
    <v-btn
      class="ms-4 my-1 mb-2 primary text-capitalize"
      color
      nuxt
      @click="toLabeling"
    >
      <v-icon left>{{ mdiPlayCircleOutline }}</v-icon>
      {{ $t('home.startAnnotation') }}
    </v-btn>

    <!-- menu lateral --------------------------------------------------->
    <v-list-item-group v-model="selected" mandatory>
      <v-list-item
        v-for="(item, i) in filteredItems"
        :key="i"
        @click="$router.push(localePath(`/projects/${$route.params.id}/${item.link}`))"
      >
        <v-list-item-action>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>{{ item.text }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
import {
  mdiAccount,
  mdiBookOpenOutline,
  mdiChartBar,
  mdiCog,
  mdiCommentAccountOutline,
  mdiDatabase,
  mdiViewDashboardEdit,
  mdiHome,
  mdiLabel,
  mdiChartBox,
  mdiPlayCircleOutline,
  mdiCompare,
  mdiBallot,
  mdiFileChartCheckOutline        // ← novo ícone
} from '@mdi/js'

import { getLinkToAnnotationPage } from '~/presenter/linkToAnnotationPage'

export default {
  props: {
    isProjectAdmin: { type: Boolean, default: false, required: true },
    project:       { type: Object,   default: () => ({}), required: true }
  },

  data () {
    return {
      selected: 0,
      mdiPlayCircleOutline
    }
  },

  computed: {
    filteredItems () {
      const items = [
        /* ――― básicos ――― */
        { icon: mdiHome,      text: this.$t('projectHome.home'), link: '',         isVisible: true },
        { icon: mdiDatabase,  text: this.$t('dataset.dataset'), link: 'dataset',  isVisible: true },

        /* ――― labels / relations (dependem de permissões) ――― */
        {
          icon: mdiLabel,
          text: this.$t('labels.labels'),
          link: 'labels',
          isVisible:
            (this.isProjectAdmin || this.project.allowMemberToCreateLabelType) &&
            this.project.canDefineLabel
        },
        {
          icon: mdiLabel,
          text: 'Relations',
          link: 'links',
          isVisible:
            (this.isProjectAdmin || this.project.allowMemberToCreateLabelType) &&
            this.project.canDefineRelation
        },

        /* ――― admin-only ――― */
        { icon: mdiAccount,             text: this.$t('members.members'), link: 'members',     isVisible: this.isProjectAdmin },
        { icon: mdiCommentAccountOutline, text: 'Comments',                link: 'comments',    isVisible: this.isProjectAdmin },
        { icon: mdiViewDashboardEdit,   text: 'Perspective',              link: 'perspective', isVisible: this.isProjectAdmin },
        { icon: mdiBookOpenOutline,     text: this.$t('guideline.guideline'), link: 'guideline', isVisible: this.isProjectAdmin },
        { icon: mdiChartBar,            text: this.$t('statistics.statistics'), link: 'metrics', isVisible: this.isProjectAdmin },

        /* ――― sempre visíveis ――― */
        { icon: mdiChartBox, text: this.$t('Discrepancies'),         link: 'discrepancies',        isVisible: true },

        /* ↓↓↓ NOVOS/EXISTENTES ↓↓↓ */
        {
          icon: mdiCompare,
          text: 'Annotations Comparator',
          link: 'annotations-comparator',
          isVisible: true
        },

        {
          icon: mdiBallot,
          text: 'Discussion',
          link: 'discussion',
          isVisible: true
        },

        {
          icon: mdiFileChartCheckOutline,   // ← novo item “Statistics”
          text: 'Statistics',
          link: 'statistics',
          isVisible: true
        },

        /* ――― settings (admin) ――― */
        { icon: mdiCog, text: this.$t('settings.title'), link: 'settings', isVisible: this.isProjectAdmin }
      ]

      return items.filter(i => i.isVisible)
    }
  },

  methods: {
    toLabeling () {
      const query = this.$services.option.findOption(this.$route.params.id)
      const link  = getLinkToAnnotationPage(this.$route.params.id, this.project.projectType)
      this.$router.push({ path: this.localePath(link), query })
    }
  }
}
</script>
