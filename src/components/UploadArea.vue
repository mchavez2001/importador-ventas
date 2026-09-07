<script setup>
import { computed, ref } from 'vue'
import {
  FileSpreadsheet,
  UploadCloud,
  X,
} from 'lucide-vue-next'

const props = defineProps({
  archivo: {
    type: Object,
    default: null,
  },

  cargando: {
    type: Boolean,
    default: false,
  },

  progreso: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'seleccionar',
  'limpiar',
  'importar',
])

const inputArchivo = ref(null)
const arrastrando = ref(false)

const tamanoArchivo = computed(() => {
  if (!props.archivo) {
    return ''
  }

  const bytes = props.archivo.size

  if (bytes < 1024) {
    return `${bytes} bytes`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`
})

function abrirSelector() {
  if (!props.cargando) {
    inputArchivo.value?.click()
  }
}

function procesarArchivo(archivo) {
  if (!archivo) {
    return
  }

  emit('seleccionar', archivo)
}

function cambiarArchivo(event) {
  procesarArchivo(event.target.files?.[0])
  event.target.value = ''
}

function soltarArchivo(event) {
  arrastrando.value = false

  procesarArchivo(
    event.dataTransfer.files?.[0]
  )
}
</script>

<template>
  <section class="upload-card">
    <input
      ref="inputArchivo"
      type="file"
      accept=".xlsx,.xls"
      class="sr-only"
      :disabled="cargando"
      @change="cambiarArchivo"
    />

    <div
      v-if="!archivo"
      :class="[
        'drop-zone',
        {
          'drop-zone--active': arrastrando,
          'drop-zone--disabled': cargando,
        },
      ]"
      @click="abrirSelector"
      @dragenter.prevent="arrastrando = true"
      @dragover.prevent="arrastrando = true"
      @dragleave.prevent="arrastrando = false"
      @drop.prevent="soltarArchivo"
    >
      <div class="drop-zone__icon">
        <UploadCloud :size="32" />
      </div>

      <h2>Selecciona el Excel de ventas</h2>

      <p>
        Arrastra el archivo hasta aquí o haz clic
        para seleccionarlo.
      </p>

      <span class="drop-zone__help">
        Formatos XLSX o XLS. Tamaño máximo 10 MB.
      </span>
    </div>

    <div
      v-else
      class="selected-file"
    >
      <div class="selected-file__content">
        <div class="selected-file__icon">
          <FileSpreadsheet :size="27" />
        </div>

        <div class="selected-file__info">
          <strong>{{ archivo.name }}</strong>

          <span>{{ tamanoArchivo }}</span>
        </div>
      </div>

      <button
        v-if="!cargando"
        type="button"
        class="icon-button"
        title="Quitar archivo"
        @click="emit('limpiar')"
      >
        <X :size="20" />
      </button>

      <div
        v-if="cargando"
        class="upload-progress"
      >
        <div class="upload-progress__header">
          <span>Importando información</span>

          <strong>{{ progreso }}%</strong>
        </div>

        <div class="upload-progress__track">
          <div
            class="upload-progress__bar"
            :style="{ width: `${progreso}%` }"
          />
        </div>
      </div>

      <div
        v-if="!cargando"
        class="selected-file__actions"
      >
        <button
          type="button"
          class="secondary-button"
          @click="abrirSelector"
        >
          Cambiar archivo
        </button>

        <button
          type="button"
          class="primary-button"
          @click="emit('importar')"
        >
          <UploadCloud :size="18" />

          Importar ventas
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.upload-card {
  margin-bottom: 30px;
}

.drop-zone {
  background: white;
  border: 2px dashed #93c5fd;
  border-radius: 28px;
  padding: 70px 30px;
  text-align: center;
  cursor: pointer;
  transition: .25s;
}

.drop-zone:hover {
  border-color: #2563eb;
  background: #f8fbff;
}

.drop-zone__icon {
  width: 82px;
  height: 82px;
  border-radius: 24px;
  background: #eff6ff;
  color: #2563eb;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone h2 {
  margin-top: 20px;
  color: #0f172a;
}

.drop-zone p {
  margin-top: 10px;
  color: #64748b;
}

.drop-zone__help {
  display: block;
  margin-top: 16px;
  color: #94a3b8;
}

.selected-file {
  background: white;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.selected-file__content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-file__icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #ecfeff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-file__actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.primary-button {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.secondary-button {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
}

.upload-progress {
  margin-top: 20px;
}

.upload-progress__track {
  height: 12px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.upload-progress__bar {
  height: 100%;
  background: #2563eb;
}

.upload-progress__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>