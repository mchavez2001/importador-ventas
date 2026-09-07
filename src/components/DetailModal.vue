<script setup>
import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Package,
  ReceiptText,
  WalletCards,
  X,
} from 'lucide-vue-next'
import StatusBadge from './StatusBadge.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  venta: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['cerrar'])

function moneda(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible && venta"
        class="modal-backdrop"
        @click.self="emit('cerrar')"
      >
        <section class="detail-modal">
          <header class="detail-modal__header">
            <div>
              <span class="detail-modal__eyebrow">
                Venta #{{ venta.cod_venta }}
              </span>

              <h2>{{ venta.cliente }}</h2>

              <p>
                Fila {{ venta.fila }} · Cuenta
                #{{ venta.cuenta }}
              </p>
            </div>

            <button
              type="button"
              class="modal-close"
              @click="emit('cerrar')"
            >
              <X :size="20" />
            </button>
          </header>

          <div class="detail-modal__status">
            <StatusBadge
              :cancelada="venta.venta_cancelada"
              :importe-pendiente="
                Number(
                  venta.importe_pendiente_venta
                )
              "
            />

            <span>
              {{ venta.fecha }}
            </span>
          </div>

          <div class="detail-grid">
            <article class="detail-box">
              <ReceiptText :size="20" />

              <span>Importe de venta</span>

              <strong>
                {{ moneda(venta.importe_venta) }}
              </strong>
            </article>

            <article class="detail-box">
              <WalletCards :size="20" />

              <span>Pendiente</span>

              <strong>
                {{
                  moneda(
                    venta.importe_pendiente_venta
                  )
                }}
              </strong>
            </article>

            <article class="detail-box">
              <CreditCard :size="20" />

              <span>Método de pago</span>

              <strong>
                {{ venta.metodo_pago || 'No indicado' }}
              </strong>
            </article>

            <article class="detail-box">
              <Package :size="20" />

              <span>Productos registrados</span>

              <strong>
                {{ venta.productos_creados }}
              </strong>
            </article>

            <article class="detail-box">
              <CircleDollarSign :size="20" />

              <span>Saldo anterior</span>

              <strong>
                {{ moneda(venta.saldo_anterior) }}
              </strong>
            </article>

            <article class="detail-box">
              <Banknote :size="20" />

              <span>Saldo final</span>

              <strong>
                {{ moneda(venta.saldo_final) }}
              </strong>
            </article>
          </div>

          <section class="detail-section">
            <h3>Información del abono</h3>

            <div
              v-if="venta.abono_creado"
              class="abono-detail"
            >
              <div>
                <span>Código</span>
                <strong>
                  #{{ venta.cod_abono }}
                </strong>
              </div>

              <div>
                <span>Monto</span>
                <strong>
                  {{ moneda(venta.monto_abono) }}
                </strong>
              </div>

              <div>
                <span>Método</span>
                <strong>
                  {{ venta.metodo_abono }}
                </strong>
              </div>

              <div>
                <span>Monto aplicado</span>
                <strong>
                  {{
                    moneda(
                      venta.monto_abono_aplicado
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Sobrante</span>
                <strong>
                  {{
                    moneda(
                      venta.sobrante_abono
                    )
                  }}
                </strong>
              </div>
            </div>

            <p
              v-else
              class="detail-section__empty"
            >
              Esta fila no registró un abono.
            </p>
          </section>

          <section
            v-if="
              venta.ventas_afectadas_por_abono
                ?.length
            "
            class="detail-section"
          >
            <h3>Ventas afectadas por el abono</h3>

            <div class="affected-list">
              <article
                v-for="afectada in
                  venta.ventas_afectadas_por_abono"
                :key="afectada.cod_venta"
                class="affected-item"
              >
                <strong>
                  Venta #{{ afectada.cod_venta }}
                </strong>

                <span>
                  Anterior:
                  {{
                    moneda(
                      afectada.pendiente_anterior
                    )
                  }}
                </span>

                <span>
                  Aplicado:
                  {{
                    moneda(
                      afectada.abono_aplicado
                    )
                  }}
                </span>

                <span>
                  Nuevo:
                  {{
                    moneda(
                      afectada.pendiente_nuevo
                    )
                  }}
                </span>
              </article>
            </div>
          </section>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.detail-modal {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 24px;
  overflow: auto;
  max-height: 90vh;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
}

.detail-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 28px;
  border-bottom: 1px solid #e2e8f0;
}

.detail-modal__eyebrow {
  color: #2563eb;
  font-weight: 600;
}

.modal-close {
  border: none;
  background: #f1f5f9;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  cursor: pointer;
}

.detail-modal__status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
}

.detail-grid {
  display: grid;
  gap: 16px;
  padding: 0 28px 28px;
  grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
}

.detail-box {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-box strong {
  font-size: 20px;
  color: #0f172a;
}

.detail-box span {
  color: #64748b;
}

.detail-section {
  padding: 0 28px 28px;
}

.detail-section h3 {
  margin-bottom: 16px;
}

.abono-detail {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
}

.abono-detail div {
  background: #f8fafc;
  padding: 16px;
  border-radius: 14px;
}

.abono-detail span {
  display: block;
  color: #64748b;
  margin-bottom: 8px;
}

.affected-list {
  display: grid;
  gap: 16px;
}

.affected-item {
  background: #f8fafc;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-section__empty {
  padding: 20px;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
}

.modal-enter-active,
.modal-leave-active {
  transition: .25s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(.95);
}
</style>