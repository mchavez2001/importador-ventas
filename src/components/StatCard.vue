<script setup>
defineProps({
  titulo: {
    type: String,
    required: true,
  },

  valor: {
    type: [Number, String],
    default: 0,
  },

  descripcion: {
    type: String,
    default: '',
  },

  color: {
    type: String,
    default: 'blue',
  },
})
</script>

<template>
  <article :class="['stat-card', `stat-card--${color}`]">
    <div class="stat-card__icon">
      <slot name="icon" />
    </div>

    <div class="stat-card__value">
      {{ valor }}
    </div>

    <h3 class="stat-card__title">
      {{ titulo }}
    </h3>

    <p
      v-if="descripcion"
      class="stat-card__description"
    >
      {{ descripcion }}
    </p>
  </article>
</template>

<style scoped>
.stat-card {
  background: white;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
  transition: .25s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-card__icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.stat-card--blue .stat-card__icon {
  background: #dbeafe;
  color: #2563eb;
}

.stat-card--green .stat-card__icon {
  background: #dcfce7;
  color: #16a34a;
}

.stat-card--amber .stat-card__icon {
  background: #fef3c7;
  color: #d97706;
}

.stat-card--red .stat-card__icon {
  background: #fee2e2;
  color: #dc2626;
}

.stat-card__value {
  font-size: 42px;
  font-weight: 700;
  color: #0f172a;
}

.stat-card__title {
  margin-top: 10px;
  color: #334155;
}

.stat-card__description {
  margin-top: 6px;
  font-size: 14px;
  color: #64748b;
}
</style>