<script setup>
import {
  AlertTriangle,
  X,
} from 'lucide-vue-next'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  archivo: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'cancelar',
  'confirmar',
])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="modal-backdrop"
        @click.self="emit('cancelar')"
      >
        <section class="confirm-modal">
          <button
            type="button"
            class="modal-close"
            @click="emit('cancelar')"
          >
            <X :size="19" />
          </button>

          <div class="confirm-modal__icon">
            <AlertTriangle :size="28" />
          </div>

          <h2>Confirmar importación</h2>

          <p>
            Se procesará el archivo
            <strong>{{ archivo?.name }}</strong>.
          </p>

          <p class="confirm-modal__warning">
            La importación modificará ventas, productos,
            abonos y saldos de cuentas.
          </p>

          <div class="confirm-modal__actions">
            <button
              type="button"
              class="secondary-button"
              @click="emit('cancelar')"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="primary-button"
              @click="emit('confirmar')"
            >
              Sí, importar
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.confirm-modal {
  width: 100%;
  max-width: 520px;
  background: white;
  padding: 32px;
  border-radius: 24px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  border: none;
  background: #f1f5f9;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  cursor: pointer;
}

.confirm-modal__icon {
  width: 72px;
  height: 72px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-bottom: 20px;
}

.confirm-modal__warning {
  margin-top: 16px;
  color: #64748b;
}

.confirm-modal__actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 28px;
}

.primary-button {
  border: none;
  background: #2563eb;
  color: white;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background: white;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
}
</style>