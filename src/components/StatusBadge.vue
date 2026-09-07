<script setup>
import { computed } from 'vue'

const props = defineProps({
  cancelada: {
    type: Boolean,
    default: false,
  },

  importePendiente: {
    type: Number,
    default: 0,
  },
})

const texto = computed(() => {
  if (
    props.cancelada ||
    Number(props.importePendiente) <= 0
  ) {
    return 'Cancelada'
  }

  return 'Pendiente'
})

const clase = computed(() => {
  return texto.value === 'Cancelada'
    ? 'status-badge status-badge--success'
    : 'status-badge status-badge--warning'
})
</script>

<template>
  <span :class="clase">
    {{ texto }}
  </span>
</template>

<style scoped>
.status-badge {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge--success {
  background: #dcfce7;
  color: #15803d;
}

.status-badge--warning {
  background: #fef3c7;
  color: #b45309;
}
</style>