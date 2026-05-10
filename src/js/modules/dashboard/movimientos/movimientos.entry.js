import logger from "../../../core/logger.js";
import { movimientosService } from "./movimientos.service.js";
import { movimientosView } from "./movimientos.view.js";

export async function inicializarMovimientos() {
  logger.info("Inicializando vista de movimientos...");

  const tabs = Array.from(document.querySelectorAll(".mov-tab"));
  const panels = Array.from(document.querySelectorAll(".mov-panel"));
  const tabla = document.getElementById("tablaMovimientos");
  const estado = document.getElementById("estadoCargaMovimientos");
  const btnRecargar = document.getElementById("btnRecargarMovimientos");
  const btnAplicar = document.getElementById("btnAplicarFiltros");
  const btnLimpiar = document.getElementById("btnLimpiarFiltros");
  const filtroTipo = document.getElementById("filtroTipoMovimiento");
  const filtroProducto = document.getElementById("filtroProductoMovimiento");
  const filtroEmpleado = document.getElementById("filtroEmpleadoMovimiento");
  const filtroDesde = document.getElementById("filtroFechaDesde");
  const filtroHasta = document.getElementById("filtroFechaHasta");

  if (!tabla || !estado || tabs.length === 0) {
    logger.warn("Elementos del DOM de movimientos no encontrados");
    return;
  }

  // ── Visibilidad de tabs por rol ──────────────────────────────────────
  const TABS_POR_ROL = {
    admin:       ["entrada", "salida", "baja", "historial"],
    propietario: ["entrada", "salida", "baja", "historial"],
    bodeguero:   ["entrada", "baja", "historial"],
    vendedor:    ["salida", "historial"],
    pendiente:   ["historial"],
  };

  const rol            = obtenerRolDesdeToken();
  const tabsPermitidas = TABS_POR_ROL[rol] ?? ["historial"];

  // Ocultar tabs y paneles no permitidos para este rol
  // Nota: style.display en lugar de hidden porque el CSS .mov-tab { display: inline-flex }
  // sobreescribe el atributo hidden del navegador
  tabs.forEach((tab) => {
    if (!tabsPermitidas.includes(tab.dataset.tab)) tab.style.display = "none";
  });
  panels.forEach((panel) => {
    if (!tabsPermitidas.includes(panel.dataset.panel)) panel.hidden = true;
  });

  // Operar solo sobre los elementos permitidos desde aquí en adelante
  const tabsVisibles   = tabs.filter((t) => tabsPermitidas.includes(t.dataset.tab));
  const panelsVisibles = panels.filter((p) => tabsPermitidas.includes(p.dataset.panel));

  // Tabs
  tabsVisibles.forEach((tab) => {
    if (tab.dataset.listener) return;
    tab.dataset.listener = "true";
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      const panel  = panelsVisibles.find((p) => p.dataset.panel === target);
      if (panel) movimientosView.cambiarTab(tab, panel, tabsVisibles, panelsVisibles);
    });
  });

  // Activar la primera tab permitida (prioriza formularios sobre historial)
  const primeraTab = tabsVisibles.find((t) => t.dataset.tab !== "historial") ?? tabsVisibles[0];
  if (primeraTab) {
    const primerPanel = panelsVisibles.find((p) => p.dataset.panel === primeraTab.dataset.tab);
    if (primerPanel) movimientosView.cambiarTab(primeraTab, primerPanel, tabsVisibles, panelsVisibles);
  }

  // Cargar datos auxiliares (productos y empleados) en paralelo
  // `let` permite actualizar productos tras cada movimiento registrado
  const ROLES_CON_EMPLEADOS = ["admin", "propietario"];
  let [productos, empleados] = await Promise.all([
    movimientosService.getProductos().catch(() => []),
    ROLES_CON_EMPLEADOS.includes(rol)
      ? movimientosService.getEmpleados().catch(() => [])
      : Promise.resolve([]),   // vendedor/bodeguero/pendiente: no consultar el endpoint
  ]);

  // Poblar selects de los formularios y filtros
  panels.forEach((panel) => {
    const select = panel.querySelector('select[name="id_producto"]');
    if (select) {
      movimientosView.renderProductoSelect(select, productos);
      select.addEventListener("change", () => {
        const opt = select.options[select.selectedIndex];
        const stock = opt ? opt.dataset.stock ?? null : null;
        movimientosView.setStockActual(panel, stock);
      });
    }
  });

  if (filtroProducto) {
    movimientosView.renderProductoSelect(filtroProducto, productos, "Todos");
  }
  if (filtroEmpleado && empleados.length) {
    movimientosView.renderEmpleadoSelect(filtroEmpleado, empleados);
  }

  // Listeners de historial
  attach(btnRecargar, "click", cargarMovimientos);
  attach(btnAplicar, "click", cargarMovimientos);
  attach(btnLimpiar, "click", () => {
    if (filtroTipo) filtroTipo.value = "";
    if (filtroProducto) filtroProducto.value = "";
    if (filtroEmpleado) filtroEmpleado.value = "";
    if (filtroDesde) filtroDesde.value = "";
    if (filtroHasta) filtroHasta.value = "";
    cargarMovimientos();
  });

  // Submit handlers para los 3 formularios
  conectarFormulario("formEntrada", "entrada");
  conectarFormulario("formSalida", "salida");
  conectarFormulario("formBaja", "baja");

  await cargarMovimientos();

  function conectarFormulario(formId, tipo) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.listener) return;
    form.dataset.listener = "true";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      try {
        const resp = await movimientosService.registrar(tipo, data);
        alert(`✅ ${resp.mensaje}\nStock: ${resp.stock_anterior} → ${resp.stock_nuevo}`);
        form.reset();
        // Refrescar productos (los stocks cambiaron) y movimientos
        const prods = await movimientosService.getProductos().catch(() => []);
        productos = prods; // actualiza closure para que renderKPIs use el stock nuevo
        panels.forEach((p) => {
          const sel = p.querySelector('select[name="id_producto"]');
          if (sel) movimientosView.renderProductoSelect(sel, prods);
          movimientosView.setStockActual(p, null);
        });
        if (filtroProducto) {
          movimientosView.renderProductoSelect(filtroProducto, prods, "Todos");
        }
        await cargarMovimientos();
      } catch (err) {
        alert(`❌ ${err.message}`);
      }
    });
  }

  async function cargarMovimientos() {
    movimientosView.setEstado(estado, "⏳ Cargando movimientos...");
    try {
      const filtros = {
        id_producto: filtroProducto?.value,
        tipo: filtroTipo?.value,
        id_empleado: filtroEmpleado?.value,
        fecha_desde: filtroDesde?.value,
        fecha_hasta: filtroHasta?.value,
      };
      const movimientos = await movimientosService.getAll(filtros);
      movimientosView.renderTabla(movimientos, tabla, estado);
      movimientosView.renderKPIs(movimientos, productos);
    } catch (err) {
      logger.error({ err }, "Error cargando movimientos");
      movimientosView.setEstado(estado, "💥 Error al conectar con el servidor.");
    }
  }
}

function attach(el, event, handler) {
  if (!el || el.dataset.listener) return;
  el.dataset.listener = "true";
  el.addEventListener(event, handler);
}

/** Lee el campo `rol` del JWT en localStorage sin verificar firma. */
function obtenerRolDesdeToken() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.rol ?? null;
  } catch {
    return null;
  }
}
