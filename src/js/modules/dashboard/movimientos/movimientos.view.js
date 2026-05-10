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
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
