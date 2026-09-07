<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'No hay información',
  },

  descripcion: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon" />
    </div>

    <h3>
      {{ titulo }}
    </h3>

    <p v-if="descripcion">
      {{ descripcion }}
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  padding: 50px;
  text-align: center;
  background: #f8fafc;
  border-radius: 20px;
}

.empty-state__icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  background: white;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #2563eb;
  box-shadow: 0 10px 20px rgba(0,0,0,.04);
}

.empty-state h3 {
  margin-top: 18px;
  color: #0f172a;
}

.empty-state p {
  margin-top: 10px;
  color: #64748b;
}
</style>