/**
 * Vista de aprobaciones — render puro de cards y KPIs.
 * Sin lógica de negocio ni llamadas API.
 */

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tiempoRelativo(fechaISO) {
  const diff = Math.max(0, Date.now() - new Date(fechaISO).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "hace unos segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}

function emojiTipo(tipo) {
  if (tipo === "entrada") return "📥";
  if (tipo === "baja") return "🗑️";
  return "📦";
}

function colorTipo(tipo) {
  if (tipo === "entrada") return "entrada";
  if (tipo === "baja") return "baja";
  return "salida";
}

/**
 * Calcula el stock proyectado tras aprobar (preview informativo, no autoritativo).
 */
function calcularStockProyectado(stockActual, tipo, cantidad) {
  const actual = Number(stockActual ?? 0);
  const cant = Number(cantidad ?? 0);
  if (tipo === "entrada") return actual + cant;
  if (tipo === "baja") return actual - cant;
  return actual;
}

export const aprobacionesView = {
  renderEstado(estadoEl, mensaje) {
    if (estadoEl) estadoEl.textContent = mensaje;
  },

  renderKPIs(items) {
    const total = items.length;
    const entradas = items.filter((i) => i.tipo === "entrada").length;
    const bajas = items.filter((i) => i.tipo === "baja").length;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setText("kpiPendientes", total);
    setText("kpiEntradas", entradas);
    setText("kpiBajas", bajas);
  },

  renderCards(items, contenedor, estadoEl) {
    if (!contenedor) return;
    if (!items || items.length === 0) {
      contenedor.innerHTML = `<p class="aprob-lista__vacio">✨ No hay solicitudes pendientes</p>`;
      if (estadoEl) estadoEl.textContent = "";
      return;
    }

    contenedor.innerHTML = items
      .map((s) => {
        const proyectado = calcularStockProyectado(s.stock_actual, s.tipo, s.cantidad);
        const tipoNombre = s.tipo === "entrada" ? "Entrada" : "Baja";
        const solicitante = `${s.solicitante_nombre ?? ""} ${s.solicitante_apellidos ?? ""}`.trim();
        return `
          <article class="aprob-card aprob-card--${colorTipo(s.tipo)}" data-id="${s.id_solicitud}">
            <header class="aprob-card__cabecera">
              <span class="aprob-card__tipo">${emojiTipo(s.tipo)} ${tipoNombre}</span>
              <span class="aprob-card__tiempo">${tiempoRelativo(s.fecha_solicitud)}</span>
            </header>
            <h3 class="aprob-card__producto">${escapeHtml(s.producto_nombre || `Producto #${s.id_producto}`)}</h3>
            <div class="aprob-card__cantidad">
              <span class="aprob-card__valor">${s.tipo === "entrada" ? "+" : "−"}${Number(s.cantidad).toLocaleString("es-CO")}</span>
              <span class="aprob-card__unidad">${escapeHtml(s.producto_unidad || "unidades")}</span>
            </div>
            <div class="aprob-card__stock-preview">
              <span>Stock actual: <strong>${Number(s.stock_actual ?? 0).toLocaleString("es-CO")}</strong></span>
              <span class="aprob-card__flecha">→</span>
              <span>Tras aprobar: <strong>${Number(proyectado).toLocaleString("es-CO")}</strong></span>
            </div>
            ${s.motivo ? `<div class="aprob-card__campo"><b>Motivo:</b> ${escapeHtml(s.motivo)}</div>` : ""}
            ${s.observacion ? `<div class="aprob-card__campo"><b>Observación:</b> ${escapeHtml(s.observacion)}</div>` : ""}
            <div class="aprob-card__solicitante">
              👤 Solicitado por <strong>${escapeHtml(solicitante || `Empleado #${s.id_empleado_solicitante}`)}</strong>
              ${s.solicitante_rol ? ` <small>(${escapeHtml(s.solicitante_rol)})</small>` : ""}
            </div>
            <footer class="aprob-card__acciones">
              <button type="button" class="btn btn--ghost btn--sm aprob-card__btn-rechazar" data-id="${s.id_solicitud}">
                ❌ Rechazar
              </button>
              <button type="button" class="btn btn-success btn--sm aprob-card__btn-aprobar" data-id="${s.id_solicitud}">
                ✅ Aprobar
              </button>
            </footer>
          </article>
        `;
      })
      .join("");
  },
};
