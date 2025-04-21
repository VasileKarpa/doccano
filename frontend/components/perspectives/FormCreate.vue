<template>
  <v-container class="form-container">
    <v-card class="form-card">
      <v-card-title class="headline primary white--text d-flex align-center">
        <v-icon left color="white">mdi-pencil</v-icon>
        Create New Perspective
      </v-card-title>

      <v-card-text class="form-content">
        <!-- Display any error messages -->
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

        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <!-- Perspective Title -->
          <div class="input-group">
            <v-text-field
              v-model="form.name"
              label="Perspective Title"
              :error-messages="fieldErrors.name"
              :error="!!fieldErrors.name"
              :rules="[rules.required]"
              required
              outlined
              dense
              class="input-field"
              prepend-inner-icon="mdi-format-title"
              hint="Enter a descriptive title for your perspective"
              persistent-hint
            ></v-text-field>
          </div>

          <!-- Number of descriptions selector -->
          <div class="input-group">
            <v-select
              v-model="numberOfDescriptions"
              :items="descriptionOptions"
              label="Number of Etiquettes"
              :rules="[rules.required]"
              required
              outlined
              dense
              class="input-field"
              prepend-inner-icon="mdi-format-list-numbered"
              hint="Choose how many etiquettes you need (1-7)"
              persistent-hint
            ></v-select>
          </div>

          <!-- Description fields -->
          <div class="descriptions-container">
            <!-- Main description -->
            <div class="input-group">
              <v-textarea
                v-model="form.description"
                label="Etiquette 1"
                :error-messages="fieldErrors.description"
                :error="!!fieldErrors.description"
                :rules="[rules.required]"
                required
                outlined
                dense
                rows="2"
                auto-grow
                class="input-field compact-textarea"
                prepend-inner-icon="mdi-label"
                hint="Enter the main etiquette description"
                persistent-hint
              ></v-textarea>
            </div>

            <!-- Additional descriptions -->
            <div v-if="numberOfDescriptions > 1" class="additional-descriptions">
              <v-slide-y-transition group>
                <div
                  v-for="n in (numberOfDescriptions - 1)"
                  :key="n"
                  class="input-group"
                >
                  <v-textarea
                    v-model="form['description_' + n]"
                    :label="'Etiquette ' + (n + 1)"
                    :error-messages="fieldErrors['description_' + n]"
                    :error="!!fieldErrors['description_' + n]"
                    :rules="[rules.required]"
                    required
                    outlined
                    dense
                    rows="2"
                    auto-grow
                    class="input-field compact-textarea"
                    prepend-inner-icon="mdi-label-outline"
                    :hint="'Enter description for etiquette ' + (n + 1)"
                    persistent-hint
                  ></v-textarea>
                </div>
              </v-slide-y-transition>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="actions-container">
        <v-btn
          color="secondary"
          @click="$router.push('/projects')"
          class="action-btn"
          outlined
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Back to Projects
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          type="submit"
          color="primary"
          class="action-btn"
          @click="submitForm"
          :loading="loading"
        >
          <v-icon left>mdi-check</v-icon>
          Create Perspective
        </v-btn>
      </v-card-actions>

      <!-- Loading indicator -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mt-2"
      ></v-progress-linear>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      valid: false,
      loading: false,
      error: null,
      numberOfDescriptions: 1,
      descriptionOptions: [1, 2, 3, 4, 5, 6, 7],
      form: {
        name: "",
        description: "",
      },
      fieldErrors: {
        name: "",
        description: "",
        description_1: "",
        description_2: "",
        description_3: "",
        description_4: "",
        description_5: "",
        description_6: "",
      },
      rules: {
        required: (value) => !!value || "This field is required.",
      },
    };
  },
  methods: {
    validateForm() {
      // Reset all error messages
      Object.keys(this.fieldErrors).forEach(key => {
        this.fieldErrors[key] = "";
      });

      let isValid = true;

      // Validate name
      if (!this.form.name.trim()) {
        this.fieldErrors.name = "The perspective title is required";
        isValid = false;
      }

      // Validate main description
      if (!this.form.description.trim()) {
        this.fieldErrors.description = "The first etiquette is required";
        isValid = false;
      }

      // Validate additional descriptions based on selected number
      for (let i = 1; i < this.numberOfDescriptions; i++) {
        const fieldName = `description_${i}`;
        if (!this.form[fieldName]?.trim()) {
          this.fieldErrors[fieldName] = `Etiquette ${i + 1} is required`;
          isValid = false;
        }
      }

      return isValid;
    },
    async submitForm() {
      if (!this.validateForm()) {
        this.error = "Please fill in all required fields";
        return;
      }
      
      try {
        this.error = null;
        this.loading = true;

        const payload = {
          name: this.form.name,
          description: this.form.description,
        };

        if (this.numberOfDescriptions > 1) {
          for (let i = 1; i < this.numberOfDescriptions; i++) {
            payload[`description_${i}`] = this.form[`description_${i}`];
          }
        }

        await this.$repositories.perspective.createPerspective(
          this.$route.params.id,
          payload
        );

        this.$router.push(`/projects/${this.$route.params.id}/perspective`);
      } catch (error) {
        console.error("Error creating perspective:", error);
        this.error = "Failed to create perspective. Check console for details.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  height: calc(100vh - 48px);
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-height: calc(100vh - 200px);
  background-color: #fafafa;
}

.input-group {
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.input-field {
  transition: all 0.3s ease;
}

.input-field:hover {
  transform: translateY(-1px);
}

.descriptions-container {
  margin-top: 16px;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.additional-descriptions {
  margin-top: 8px;
}

.actions-container {
  padding: 16px 24px;
  background-color: #f5f5f5;
  position: sticky;
  bottom: 0;
  z-index: 1;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn {
  min-width: 160px;
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-alert {
  margin: 0 0 24px 0 !important;
  border-radius: 8px !important;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.compact-textarea {
  max-height: 100px;
  overflow-y: auto;
}

.compact-textarea .v-text-field__slot {
  min-height: 40px;
}

.compact-textarea textarea {
  font-size: 0.9rem;
  line-height: 1.4;
  padding: 8px 0;
}

.input-field.error--text {
  border-color: #dc3545 !important;
}

.input-field.error--text .v-input__slot {
  border-color: #dc3545 !important;
}

.input-field.error--text .v-messages__message {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 4px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.v-card-title {
  padding: 16px 24px;
  background: linear-gradient(45deg, #1976d2, #2196f3);
}

.v-card-title .v-icon {
  margin-right: 12px;
}
</style>
