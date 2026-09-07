<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

import {
  CreditCard,
  AlertCircle,
  Ban,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
  Info,
  ListFilter,
  ReceiptText,
  RefreshCcw,
  Search,
  UploadCloud,
  WalletCards,
  XCircle,
} from "lucide-vue-next";

import ConfirmModal from "./components/ConfirmModal.vue";
import DetailModal from "./components/DetailModal.vue";
import EmptyState from "./components/EmptyState.vue";
import StatCard from "./components/StatCard.vue";
import StatusBadge from "./components/StatusBadge.vue";
import UploadArea from "./components/UploadArea.vue";

import { importarVentas } from "./services/ventasApi";

const archivo = ref(null);
const resultado = ref(null);
const cargando = ref(false);
const progreso = ref(0);
const errorGeneral = ref("");
const mostrarConfirmacion = ref(false);
const ventaSeleccionada = ref(null);

const pestanaActiva = ref("ventas");
const busqueda = ref("");
const filtroEstado = ref("todos");
const paginaActual = ref(1);
const filasPorPagina = 10;

let abortController = null;

const tieneResultado = computed(() => {
  return resultado.value !== null;
});

const ventas = computed(() => {
  return resultado.value?.detalle || [];
});

const filasOmitidas = computed(() => {
  return resultado.value?.omitidas_detalle || [];
});

const errores = computed(() => {
  return resultado.value?.errores_detalle || [];
});

const ventasFiltradas = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();

  return ventas.value.filter((venta) => {
    const coincideTexto =
      !texto ||
      String(venta.cliente || "")
        .toLowerCase()
        .includes(texto) ||
      String(venta.cuenta || "").includes(texto) ||
      String(venta.cod_venta || "").includes(texto);

    const cancelada = venta.venta_cancelada || Number(venta.importe_pendiente_venta) <= 0;

    let coincideEstado = true;

    if (filtroEstado.value === "pendientes") {
      coincideEstado = !cancelada;
    }

    if (filtroEstado.value === "canceladas") {
      coincideEstado = cancelada;
    }

    if (filtroEstado.value === "abonos") {
      coincideEstado = venta.abono_creado === true;
    }

    return coincideTexto && coincideEstado;
  });
});

const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(ventasFiltradas.value.length / filasPorPagina));
});

const ventasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * filasPorPagina;

  return ventasFiltradas.value.slice(inicio, inicio + filasPorPagina);
});

const rangoPagina = computed(() => {
  if (ventasFiltradas.value.length === 0) {
    return "0 resultados";
  }

  const inicio = (paginaActual.value - 1) * filasPorPagina + 1;

  const fin = Math.min(paginaActual.value * filasPorPagina, ventasFiltradas.value.length);

  return `${inicio}-${fin} de ${ventasFiltradas.value.length}`;
});

const tituloResultado = computed(() => {
  if (!resultado.value) {
    return "";
  }

  if (resultado.value.ok) {
    return "Importación completada correctamente";
  }

  return "Importación completada con observaciones";
});

const claseResultado = computed(() => {
  return resultado.value?.ok
    ? "result-banner result-banner--success"
    : "result-banner result-banner--warning";
});

function seleccionarArchivo(nuevoArchivo) {
  errorGeneral.value = "";

  const extension = nuevoArchivo.name.split(".").pop()?.toLowerCase();

  if (!["xlsx", "xls"].includes(extension)) {
    errorGeneral.value = "Solo se permiten archivos XLSX o XLS.";

    return;
  }

  if (nuevoArchivo.size > 10 * 1024 * 1024) {
    errorGeneral.value = "El archivo supera el tamaño máximo de 10 MB.";

    return;
  }

  archivo.value = nuevoArchivo;
  resultado.value = null;
  busqueda.value = "";
  paginaActual.value = 1;
}

function limpiarArchivo() {
  archivo.value = null;
  resultado.value = null;
  errorGeneral.value = "";
  progreso.value = 0;
  paginaActual.value = 1;
}

function solicitarImportacion() {
  if (!archivo.value) {
    errorGeneral.value = "Selecciona un archivo Excel.";
    return;
  }

  mostrarConfirmacion.value = true;
}

async function ejecutarImportacion() {
  mostrarConfirmacion.value = false;
  cargando.value = true;
  errorGeneral.value = "";
  resultado.value = null;
  progreso.value = 0;
  paginaActual.value = 1;

  abortController = new AbortController();

  try {
    resultado.value = await importarVentas(archivo.value, {
      signal: abortController.signal,

      onProgress(porcentaje) {
        progreso.value = porcentaje;
      },
    });

    progreso.value = 100;

    pestanaActiva.value =
      resultado.value?.ventas_creadas > 0
        ? "ventas"
        : resultado.value?.errores > 0
        ? "errores"
        : "omitidas";
  } catch (error) {
    if (error.name === "AbortError") {
      errorGeneral.value = "La importación fue cancelada.";
    } else {
      errorGeneral.value = error.message || "Ocurrió un error al importar.";
    }
  } finally {
    cargando.value = false;
    abortController = null;
  }
}

function cancelarImportacion() {
  abortController?.abort();
}

function seleccionarPestana(pestana) {
  pestanaActiva.value = pestana;
  paginaActual.value = 1;
}

function actualizarBusqueda(event) {
  busqueda.value = event.target.value;
  paginaActual.value = 1;
}

function actualizarFiltro(event) {
  filtroEstado.value = event.target.value;
  paginaActual.value = 1;
}

function abrirDetalle(venta) {
  ventaSeleccionada.value = venta;
}

function cerrarDetalle() {
  ventaSeleccionada.value = null;
}

function paginaAnterior() {
  paginaActual.value = Math.max(1, paginaActual.value - 1);
}

function paginaSiguiente() {
  paginaActual.value = Math.min(totalPaginas.value, paginaActual.value + 1);
}

function moneda(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

function fechaLegible(fecha) {
  if (!fecha) {
    return "";
  }

  const partes = String(fecha).split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

onBeforeUnmount(() => {
  abortController?.abort();
});
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar__inner">
        <div class="brand">
          <div class="brand__icon">
            <FileSpreadsheet :size="23" />
          </div>

          <div>
            <strong>Panificadora</strong>
            <span>Gestión de ventas</span>
          </div>
        </div>

        <div class="topbar__status">
          <span class="status-dot" />
          API conectada
        </div>
      </div>
    </header>

    <ConfirmModal
      :visible="mostrarConfirmacion"
      :archivo="archivo"
      @confirmar="ejecutarImportacion"
      @cancelar="mostrarConfirmacion = false"
    />

    <DetailModal
      :visible="!!ventaSeleccionada"
      :venta="ventaSeleccionada"
      @cerrar="cerrarDetalle"
    />

    <main class="container main-content">
      <section class="page-heading">
        <div>
          <span class="page-heading__eyebrow"> Importaciones </span>

          <h1>Importar ventas desde Excel</h1>

          <p>
            Registra ventas, productos, abonos y actualiza automáticamente el saldo de las
            cuentas.
          </p>
        </div>

        <button
          v-if="tieneResultado && !cargando"
          type="button"
          class="secondary-button"
          @click="limpiarArchivo"
        >
          <RefreshCcw :size="18" />

          Nueva importación
        </button>
      </section>

      <div v-if="errorGeneral" class="alert alert--error">
        <XCircle :size="21" />

        <div>
          <strong>No se pudo completar la operación</strong>
          <p>{{ errorGeneral }}</p>
        </div>
      </div>

      <UploadArea
        :archivo="archivo"
        :cargando="cargando"
        :progreso="progreso"
        @seleccionar="seleccionarArchivo"
        @limpiar="limpiarArchivo"
        @importar="solicitarImportacion"
      />

      <div v-if="cargando" class="loading-panel">
        <div class="spinner" />

        <div>
          <strong>Procesando el archivo</strong>
          <p>No cierres esta ventana mientras se registran las ventas.</p>
        </div>

        <button type="button" class="danger-link" @click="cancelarImportacion">
          Cancelar
        </button>
      </div>

      <template v-if="tieneResultado">
        <section :class="claseResultado">
          <div class="result-banner__icon">
            <CheckCircle2 v-if="resultado.ok" :size="24" />

            <AlertCircle v-else :size="24" />
          </div>

          <div>
            <strong>{{ tituloResultado }}</strong>

            <p>
              Fecha importada:
              {{ fechaLegible(resultado.fecha_importada) }}
            </p>
          </div>
        </section>

        <section class="stats-grid">
          <StatCard
            titulo="Ventas creadas"
            :valor="resultado.ventas_creadas"
            descripcion="Registros insertados"
            color="blue"
          >
            <template #icon>
              <ReceiptText :size="21" />
            </template>
          </StatCard>

          <StatCard
            titulo="Abonos creados"
            :valor="resultado.abonos_creados"
            descripcion="Pagos registrados"
            color="green"
          >
            <template #icon>
              <Banknote :size="21" />
            </template>
          </StatCard>

          <StatCard
            titulo="Filas omitidas"
            :valor="resultado.filas_omitidas"
            descripcion="Sin movimientos"
            color="amber"
          >
            <template #icon>
              <Ban :size="21" />
            </template>
          </StatCard>

          <StatCard
            titulo="Errores"
            :valor="resultado.errores"
            descripcion="Filas no procesadas"
            color="red"
          >
            <template #icon>
              <AlertCircle :size="21" />
            </template>
          </StatCard>
        </section>

        <section class="results-card">
          <nav class="tabs">
            <button
              type="button"
              :class="[
                'tab-button',
                {
                  'tab-button--active': pestanaActiva === 'ventas',
                },
              ]"
              @click="seleccionarPestana('ventas')"
            >
              <ReceiptText :size="17" />

              Ventas

              <span>
                {{ resultado.ventas_creadas }}
              </span>
            </button>

            <button
              type="button"
              :class="[
                'tab-button',
                {
                  'tab-button--active': pestanaActiva === 'omitidas',
                },
              ]"
              @click="seleccionarPestana('omitidas')"
            >
              <Ban :size="17" />

              Omitidas

              <span>
                {{ resultado.filas_omitidas }}
              </span>
            </button>

            <button
              type="button"
              :class="[
                'tab-button',
                {
                  'tab-button--active': pestanaActiva === 'errores',
                },
              ]"
              @click="seleccionarPestana('errores')"
            >
              <AlertCircle :size="17" />

              Errores

              <span>
                {{ resultado.errores }}
              </span>
            </button>
          </nav>

          <div v-if="pestanaActiva === 'ventas'" class="results-content">
            <header class="table-toolbar">
              <div class="search-control">
                <Search :size="18" />

                <input
                  :value="busqueda"
                  type="search"
                  placeholder="Buscar cliente, cuenta o venta..."
                  @input="actualizarBusqueda"
                />
              </div>

              <div class="filter-control">
                <ListFilter :size="17" />

                <select :value="filtroEstado" @change="actualizarFiltro">
                  <option value="todos">Todos los registros</option>

                  <option value="pendientes">Ventas pendientes</option>

                  <option value="canceladas">Ventas canceladas</option>

                  <option value="abonos">Con abonos</option>
                </select>
              </div>
            </header>

            <div v-if="ventasPaginadas.length" class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Cliente</th>
                    <th>Venta</th>
                    <th>Método</th>
                    <th>Importe</th>
                    <th>Pendiente</th>
                    <th>Saldo final</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="venta in ventasPaginadas"
                    :key="venta.cod_venta || `${venta.fila}-${venta.cliente}`"
                  >
                    <td class="cell-muted">
                      {{ venta.fila }}
                    </td>

                    <td>
                      <div class="customer-cell">
                        <strong>
                          {{ venta.cliente }}
                        </strong>

                        <span> Cuenta #{{ venta.cuenta }} </span>
                      </div>
                    </td>

                    <td>
                      <strong> #{{ venta.cod_venta }} </strong>

                      <span class="cell-subtitle">
                        {{ fechaLegible(venta.fecha) }}
                      </span>
                    </td>

                    <td>
                      <span class="payment-method">
                        <CreditCard :size="15" />

                        {{ venta.metodo_pago || "No indicado" }}
                      </span>
                    </td>

                    <td class="cell-money">
                      {{ moneda(venta.importe_venta) }}
                    </td>

                    <td class="cell-money">
                      {{ moneda(venta.importe_pendiente_venta) }}
                    </td>

                    <td class="cell-money">
                      {{ moneda(venta.saldo_final) }}
                    </td>

                    <td>
                      <StatusBadge
                        :cancelada="venta.venta_cancelada"
                        :importe-pendiente="Number(venta.importe_pendiente_venta)"
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        class="table-action"
                        @click="abrirDetalle(venta)"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <EmptyState
              v-else
              titulo="No se encontraron ventas"
              descripcion="Modifica la búsqueda o el filtro seleccionado."
            >
              <template #icon>
                <Search :size="28" />
              </template>
            </EmptyState>

            <footer v-if="ventasFiltradas.length" class="pagination">
              <span>{{ rangoPagina }}</span>

              <div>
                <button
                  type="button"
                  :disabled="paginaActual <= 1"
                  @click="paginaAnterior"
                >
                  Anterior
                </button>

                <span>
                  Página {{ paginaActual }} de
                  {{ totalPaginas }}
                </span>

                <button
                  type="button"
                  :disabled="paginaActual >= totalPaginas"
                  @click="paginaSiguiente"
                >
                  Siguiente
                </button>
              </div>
            </footer>
          </div>

          <div v-if="pestanaActiva === 'omitidas'" class="results-content">
            <div v-if="filasOmitidas.length" class="message-list">
              <article
                v-for="item in filasOmitidas"
                :key="`omitida-${item.fila}-${item.cliente}`"
                class="message-item message-item--warning"
              >
                <div class="message-item__icon">
                  <Info :size="20" />
                </div>

                <div>
                  <strong>
                    {{ item.cliente || "Fila sin cliente" }}
                  </strong>

                  <p>
                    Fila {{ item.fila }}:
                    {{ item.motivo }}
                  </p>
                </div>
              </article>
            </div>

            <EmptyState
              v-else
              titulo="No hubo filas omitidas"
              descripcion="Todas las filas con información fueron procesadas."
            >
              <template #icon>
                <CheckCircle2 :size="29" />
              </template>
            </EmptyState>
          </div>

          <div v-if="pestanaActiva === 'errores'" class="results-content">
            <div v-if="errores.length" class="message-list">
              <article
                v-for="item in errores"
                :key="`error-${item.fila}-${item.cliente}`"
                class="message-item message-item--error"
              >
                <div class="message-item__icon">
                  <AlertCircle :size="20" />
                </div>

                <div>
                  <strong>
                    {{ item.cliente || "Fila sin cliente" }}
                  </strong>

                  <p>
                    Fila {{ item.fila }}:
                    {{ item.motivo || item.error || item.mensaje }}
                  </p>
                </div>
              </article>
            </div>

            <EmptyState
              v-else
              titulo="No hubo errores"
              descripcion="Todas las filas fueron procesadas correctamente."
            >
              <template #icon>
                <CheckCircle2 :size="29" />
              </template>
            </EmptyState>
          </div></section
      ></template>
    </main>
  </div>
</template>
