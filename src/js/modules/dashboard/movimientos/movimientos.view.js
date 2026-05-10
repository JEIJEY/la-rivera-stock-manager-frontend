/** Metadatos por tipo de movimiento (etiqueta y modificador delta-stock) */
const TIPO_META = {
  entrada: { etiqueta: "Entrada", delta: "suma" },
  salida:  { etiqueta: "Salida",  delta: "resta" },
  baja:    { etiqueta: "Baja",    delta: "baja" },
};

export const movimientosView = {
  /**
   * Popula los cuatro KPI cards de la cabecera.
   *
   * @param {Array}  movimientos - Lista de movimientos cargada (puede estar filtrada).
   * @param {Array}  productos   - Catálogo completo de productos (para stock total).
   *
   * KPIs de hoy se calculan filtrando `movimientos` por fecha local = hoy.
   * Stock total es la suma de `producto.stock` de todos los productos.
   */
  renderKPIs(movimientos, productos) {
    const hoy = new Date().toDateString();
    const movHoy = (movimientos ?? []).filter(
      (m) => m.fecha && new Date(m.fecha).toDateString() === hoy
    );

    const contarTipo = (tipo) => movHoy.filter((m) => m.tipo === tipo).length;
    const stockTotal = (productos ?? []).reduce(
      (suma, p) => suma + Number(p.stock ?? 0),
      0
    );

    const fijar = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.textContent = valor;
    };

    fijar("kpiEntradas",   contarTipo("entrada"));
    fijar("kpiSalidas",    contarTipo("salida"));
    fijar("kpiBajas",      contarTipo("baja"));
    fijar("kpiStockTotal", stockTotal.toLocaleString("es-CO"));

    // Actualiza el contador de la pestaña Historial
    const conteoHistorial = document.querySelector(
      ".mov-tab--historial .mov-tab__conteo"
    );
    if (conteoHistorial) {
      conteoHistorial.textContent = (movimientos ?? []).length;
    }
  },

  renderTabla(movimientos, tabla, estado) {
    tabla.innerHTML = "";

    if (!movimientos?.length) {
      estado.textContent = "📭 No hay movimientos registrados.";
      return;
    }

    movimientos.forEach((m) => {
      const tipo  = m.tipo || "entrada";
      const meta  = TIPO_META[tipo] ?? { etiqueta: tipo, delta: "suma" };
      const antes   = m.stock_anterior ?? "—";
      const despues = m.stock_nuevo    ?? "—";

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${m.id_movimiento}</td>
        <td>
          <span class="db-etiqueta db-etiqueta--${tipo}">
            <span class="db-etiqueta__punto"></span>${meta.etiqueta}
          </span>
        </td>
        <td>${escapeHtml(m.producto_nombre || `#${m.id_producto}`)}</td>
        <td class="num">${Number(m.cantidad).toLocaleString("es-CO")}</td>
        <td>${m.motivo ? escapeHtml(m.motivo) : "—"}</td>
        <td>
          <span class="db-delta-stock db-delta-stock--${meta.delta}">
            <span class="db-delta-stock__antes">${antes}</span>
            <span class="db-delta-stock__flecha">→</span>
            <span class="db-delta-stock__despues">${despues}</span>
          </span>
        </td>
        <td>${m.fecha ? new Date(m.fecha).toLocaleString("es-CO") : "—"}</td>
        <td>${m.observacion ? escapeHtml(m.observacion) : "—"}</td>
        <td>${escapeHtml(m.empleado_nombre || "—")}${m.empleado_rol ? ` <small>(${escapeHtml(m.empleado_rol)})</small>` : ""}</td>
      `;
      tabla.appendChild(fila);
    });

    estado.textContent = `✅ ${movimientos.length} movimiento(s)`;
  },

  renderProductoSelect(select, productos, placeholder = "Seleccione un producto") {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    productos.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id_producto;
      opt.dataset.stock = p.stock ?? 0;
      opt.textContent = `${p.nombre} (stock: ${p.stock ?? 0})`;
      select.appendChild(opt);
    });
  },

  renderEmpleadoSelect(select, empleados, placeholder = "Todos") {
    select.innerHTML = `<option value="">${placeholder}</option>`;
    empleados.forEach((e) => {
      const opt = document.createElement("option");
      opt.value = e.id_empleado;
      opt.textContent = `${e.nombre} ${e.apellidos || ""} (${e.rol_nombre || "-"})`;
      select.appendChild(opt);
    });
  },

  setStockActual(panel, valor) {
    const span = panel.querySelector("[data-stock-actual]");
    if (span) span.textContent = valor === null || valor === undefined ? "—" : valor;
  },

  cambiarTab(tabActiva, panelActivo, tabs, panels) {
    tabs.forEach((t) => t.classList.toggle("is-active", t === tabActiva));
    panels.forEach((p) => {
      const matches = p === panelActivo;
      p.hidden = !matches;
    });
  },

  setEstado(estado, msg) {
    if (estado) estado.textContent = msg;
  },

  /**
   * Renderiza el listado de "Mis solicitudes" del empleado actual.
   * Muestra estado con badge de color y, para pendientes, botón Cancelar.
   *
   * @param {Array} solicitudes - lista del endpoint /solicitudes-movimiento/mias
   * @param {HTMLTableSectionElement} tabla - tbody destino
   * @param {HTMLElement} estado - elemento para mostrar el mensaje de conteo
   */
  renderMisSolicitudes(solicitudes, tabla, estado) {
    tabla.innerHTML = "";
    if (!solicitudes || solicitudes.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="8" style="text-align:center;color:var(--lr-fg-muted);padding:24px">
        No has enviado solicitudes todavía
      </td>`;
      tabla.appendChild(tr);
      if (estado) estado.textContent = "";
      // Actualizar contador de tab
      const conteoTab = document.querySelector(".mov-tab--mis-solicitudes .mov-tab__conteo");
      if (conteoTab) conteoTab.textContent = "0";
      return;
    }

    const BADGES = {
      pendiente: '<span class="db-etiqueta db-etiqueta--warning">⏳ Pendiente</span>',
      aprobada:  '<span class="db-etiqueta db-etiqueta--entrada">✅ Aprobada</span>',
      rechazada: '<span class="db-etiqueta db-etiqueta--baja">❌ Rechazada</span>',
      cancelada: '<span class="db-etiqueta" style="opacity:0.6">⊘ Cancelada</span>',
    };

    solicitudes.forEach((s) => {
      const tr = document.createElement("tr");
      if (s.estado === "cancelada") tr.style.opacity = "0.6";

      const badge = BADGES[s.estado] || s.estado;
      const fechaTxt = s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleString("es-CO") : "—";
      const tipoNombre = s.tipo === "entrada" ? "Entrada" : s.tipo === "baja" ? "Baja" : "Salida";
      const obsTxt = s.observacion ? escapeHtml(s.observacion) : "—";

      // Tooltip con motivo de rechazo si aplica
      const badgeFinal = s.estado === "rechazada" && s.motivo_rechazo
        ? `<span title="${escapeHtml(s.motivo_rechazo)}">${badge}</span>`
        : badge;

      // Botón Cancelar solo si es pendiente
      const acciones = s.estado === "pendiente"
        ? `<button type="button" class="btn btn--ghost btn--sm mis-solicitudes__cancelar" data-id="${s.id_solicitud}">Cancelar</button>`
        : "—";

      tr.innerHTML = `
        <td>${s.id_solicitud}</td>
        <td><span class="db-etiqueta db-etiqueta--${s.tipo}">${tipoNombre}</span></td>
        <td>${escapeHtml(s.producto_nombre || `#${s.id_producto}`)}</td>
        <td class="num">${Number(s.cantidad).toLocaleString("es-CO")}</td>
        <td>${badgeFinal}</td>
        <td>${fechaTxt}</td>
        <td>${obsTxt}</td>
        <td>${acciones}</td>
      `;
      tabla.appendChild(tr);
    });

    if (estado) estado.textContent = `✅ ${solicitudes.length} solicitud(es)`;
    const conteoTab = document.querySelector(".mov-tab--mis-solicitudes .mov-tab__conteo");
    if (conteoTab) {
      const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
      conteoTab.textContent = pendientes > 0 ? String(pendientes) : String(solicitudes.length);
    }
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
