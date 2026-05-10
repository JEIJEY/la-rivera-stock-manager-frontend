import logger from "../../../core/logger.js";
import { movimientosService } from "./movimientos.service.js";
import { movimientosView } from "./movimientos.view.js";
import { crearEscaner } from "../shared/barcodeScanner.js";
import { barcodeApi } from "../shared/barcodeApi.js";
import { crearCarrito } from "./pos.carrito.js";
import { solicitudesMovimientoApi } from "../shared/solicitudesMovimiento.api.js";

import apiClient from "../../../core/apiClient.js";

/** Toast no-bloqueante — reemplaza alert() en flujos de escaneo */
function toast(msg, tipo = "ok", duracion = 4000) {
  const id = "bc-toast-global";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText = [
      "position:fixed", "top:16px", "left:50%", "transform:translateX(-50%)",
      "padding:14px 22px", "border-radius:10px", "font-size:15px", "font-weight:600",
      "box-shadow:0 8px 24px rgba(0,0,0,0.25)", "z-index:2147483647",
      "transition:opacity 0.25s", "pointer-events:none",
      "max-width:90vw", "text-align:center",
    ].join(";");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = tipo === "ok" ? "#16a34a" : tipo === "warn" ? "#d97706" : "#dc2626";
  el.style.color = "#fff";
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; }, duracion);
}

/**
 * Cuando un código no está registrado, muestra un diálogo para asignarlo
 * a un producto existente y guarda el vínculo en la DB.
 * Retorna el producto asignado o null si el usuario cancela.
 */
function asignarCodigo(codigo, productos) {
  return new Promise((resolve) => {
    // Defensa: nunca abrir el diálogo con código vacío
    const codigoLimpio = String(codigo || "").trim();
    if (!codigoLimpio) { resolve(null); return; }

    const DIALOG_ID = "bc-asignar-dialog";
    let dlg = document.getElementById(DIALOG_ID);
    if (dlg) dlg.remove();

    dlg = document.createElement("dialog");
    dlg.id = DIALOG_ID;
    dlg.style.cssText = "border:none;border-radius:12px;padding:24px;width:min(400px,95vw);box-shadow:0 20px 60px rgba(0,0,0,0.3)";
    dlg.innerHTML = `
      <h3 style="margin:0 0 8px;font-size:1rem;font-weight:600">Código no registrado</h3>
      <p style="margin:0 0 16px;font-size:0.875rem;color:#6b7280">
        Código leído: <strong style="color:#111;font-family:monospace">${codigoLimpio}</strong><br>
        Seleccioná el producto al que pertenece:
      </p>
      <select id="bcAsignarSelect" style="width:100%;padding:8px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:0.875rem;margin-bottom:16px">
        <option value="">-- Seleccionar producto --</option>
        ${productos.map(p => `<option value="${p.id_producto}">${p.nombre}</option>`).join("")}
      </select>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button id="bcAsignarCancelar" style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem">Cancelar</button>
        <button id="bcAsignarConfirmar" style="padding:8px 16px;border:none;border-radius:6px;background:#2563eb;color:#fff;cursor:pointer;font-size:0.875rem;font-weight:500">Asignar y continuar</button>
      </div>
    `;
    document.body.appendChild(dlg);
    dlg.showModal();

    dlg.querySelector("#bcAsignarCancelar").onclick = () => { dlg.close(); resolve(null); };
    dlg.querySelector("#bcAsignarConfirmar").onclick = async () => {
      const id = dlg.querySelector("#bcAsignarSelect").value;
      if (!id) return;
      const producto = productos.find(p => p.id_producto === Number(id));
      if (!producto) return;
      try {
        await apiClient.put(`/productos/${id}`, { ...producto, codigo_barras: codigoLimpio });
        producto.codigo_barras = codigoLimpio; // actualiza el objeto local
        dlg.close();
        toast(`✅ Código asignado a ${producto.nombre}`);
        resolve(producto);
      } catch {
        toast("❌ No se pudo guardar el código", "error");
        dlg.close();
        resolve(null);
      }
    };
  });
}

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
  // "mis-solicitudes" solo lo ven roles que pueden crear solicitudes
  // (vendedor, bodeguero, admin). Admin/propietario ven sus propias
  // solicitudes para auditoría, pero el flujo principal de aprobación
  // está en la vista #aprobaciones.
  const TABS_POR_ROL = {
    admin:       ["entrada", "salida", "baja", "historial", "mis-solicitudes"],
    propietario: ["entrada", "salida", "baja", "historial", "mis-solicitudes"],
    bodeguero:   ["entrada", "baja", "historial", "mis-solicitudes"],
    vendedor:    ["salida", "historial", "mis-solicitudes"],
    pendiente:   ["historial"],
  };

  const rol            = obtenerRolDesdeToken();
  const tabsPermitidas = TABS_POR_ROL[rol] ?? ["historial"];

  // Vendedor: ocultar "Recargar" del header (la app refresca sola tras cada acción)
  if (rol === "vendedor" && btnRecargar) btnRecargar.style.display = "none";

  // Vendedor: ocultar filtros que no le aportan (Tipo y Empleado)
  if (rol === "vendedor") {
    document.querySelectorAll(".db-barra-filtros__grupo").forEach((grupo) => {
      const select = grupo.querySelector("select");
      if (select?.id === "filtroTipoMovimiento" || select?.id === "filtroEmpleadoMovimiento") {
        grupo.style.display = "none";
        // También ocultar el separador siguiente si existe
        const sep = grupo.nextElementSibling;
        if (sep?.classList.contains("db-barra-filtros__separador")) sep.style.display = "none";
      }
    });
  }

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

  // Submit handlers para formularios de entrada y baja
  conectarFormulario("formEntrada", "entrada");
  conectarFormulario("formBaja", "baja");
  // formSalida ya no existe — reemplazado por el carrito POS

  // ── Tab "Mis solicitudes" — listado y cancelación ─────────────────────
  conectarMisSolicitudes();

  // ── Scanner para entrada y baja ──────────────────────────────────────
  conectarScannerMovimiento("formEntrada");
  conectarScannerMovimiento("formBaja");

  // ── Carrito POS (panel salida) ───────────────────────────────────────
  const posCarritoBody  = document.getElementById("posCarritoBody");
  const posCarritoVacio = document.getElementById("posCarritoVacio");
  const posTotalItems   = document.getElementById("posTotalItems");
  const posBtnRegistrar = document.getElementById("posBtnRegistrar");
  const posBtnLimpiar   = document.getElementById("posBtnLimpiar");
  const btnScanearCarrito   = document.getElementById("btnScanearCarrito");
  const btnAgregarAlCarrito = document.getElementById("btnAgregarAlCarrito");
  const posSelectProducto   = document.getElementById("posSelectProducto");

  if (posCarritoBody && posSelectProducto) {
    // Poblar select manual del carrito
    movimientosView.renderProductoSelect(posSelectProducto, productos);

    const carrito = crearCarrito({
      bodyEl:  posCarritoBody,
      vacioEl: posCarritoVacio,
      totalEl: posTotalItems,
      onCambio: (items) => {
        if (posBtnRegistrar) posBtnRegistrar.disabled = items.length === 0;
      },
    });

    // Agregar manualmente desde el select
    attach(btnAgregarAlCarrito, "click", () => {
      const opt = posSelectProducto.options[posSelectProducto.selectedIndex];
      if (!opt?.value) return;
      const prod = productos.find((p) => p.id_producto === Number(opt.value));
      if (prod) {
        carrito.agregar(prod);
        toast(`✅ ${prod.nombre} agregado al carrito`);
      }
      posSelectProducto.value = "";
    });

    // Escanear → agregar al carrito
    const escanerCarrito = crearEscaner({
      onScan: async (codigo) => {
        try {
          let producto = await barcodeApi.getByBarcode(codigo).catch(() => null);
          if (!producto) {
            producto = await asignarCodigo(codigo, productos);
            if (!producto) return;
          }
          const local = productos.find((p) => p.id_producto === producto.id_producto) ?? producto;
          carrito.agregar(local);
          toast(`✅ ${local.nombre} agregado al carrito`);
        } catch {
          toast(`❌ Error al procesar el código: ${codigo}`, "error");
        }
      },
      onError: (msg) => logger.warn(msg),
    });
    attach(btnScanearCarrito, "click", () => escanerCarrito.abrir());

    // Limpiar carrito
    attach(posBtnLimpiar, "click", () => carrito.limpiar());

    // Registrar todo — secuencial para respetar SELECT FOR UPDATE del backend
    attach(posBtnRegistrar, "click", async () => {
      const items = carrito.getItems();
      if (!items.length) return;
      posBtnRegistrar.disabled = true;

      const errores = [];
      for (const item of items) {
        try {
          await movimientosService.registrar("salida", {
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            observacion: "Venta POS (múltiple)",
          });
        } catch (err) {
          errores.push(`${item.nombre}: ${err.message}`);
        }
      }

      if (errores.length) {
        alert(`⚠️ Algunos artículos fallaron:\n\n${errores.join("\n")}`);
      } else {
        alert(`✅ ${items.length} salida(s) registradas correctamente`);
      }

      carrito.limpiar();

      // Refrescar stocks
      const prods = await movimientosService.getProductos().catch(() => []);
      productos = prods;
      movimientosView.renderProductoSelect(posSelectProducto, prods);
      panels.forEach((p) => {
        const sel = p.querySelector('select[name="id_producto"]');
        if (sel) movimientosView.renderProductoSelect(sel, prods);
        movimientosView.setStockActual(p, null);
      });
      if (filtroProducto) movimientosView.renderProductoSelect(filtroProducto, prods, "Todos");
      await cargarMovimientos();
    });
  }

  await cargarMovimientos();

  // ── Escáner para selector de producto (entrada / baja) ───────────────
  function conectarScannerMovimiento(formId) {
    const form    = document.getElementById(formId);
    const btnScan = form?.querySelector(".mov-selector-producto__scan");
    const select  = form?.querySelector('select[name="id_producto"]');
    if (!btnScan || !select) return;

    const escaner = crearEscaner({
      onScan: async (codigo) => {
        try {
          const producto = await barcodeApi.getByBarcode(codigo);
          const opt = Array.from(select.options).find(
            (o) => Number(o.value) === producto.id_producto
          );
          if (opt) {
            select.value = opt.value;
            select.dispatchEvent(new Event("change"));
            toast(`✅ ${producto.nombre} seleccionado`);
          } else {
            toast(`⚠️ ${producto.nombre} no está disponible en esta lista.`, "warn");
          }
        } catch {
          // Código no registrado → ofrecer asignarlo
          const productosList = Array.from(select.options)
            .filter(o => o.value)
            .map(o => ({ id_producto: Number(o.value), nombre: o.text }));
          const asignado = await asignarCodigo(codigo, productosList);
          if (asignado) {
            const opt = Array.from(select.options).find(o => Number(o.value) === asignado.id_producto);
            if (opt) {
              select.value = opt.value;
              select.dispatchEvent(new Event("change"));
              toast(`✅ ${asignado.nombre} seleccionado`);
            }
          }
        }
      },
      onError: (msg) => logger.warn(msg),
    });

    btnScan.addEventListener("click", () => escaner.abrir());
  }

  function conectarFormulario(formId, tipo) {
    const form = document.getElementById(formId);
    if (!form || form.dataset.listener) return;
    form.dataset.listener = "true";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());

      // Vendedor en entrada/baja → crear Solicitud (workflow de aprobación)
      // En salida → flujo normal (las ventas no requieren aprobación)
      const requiereAprobacion =
        rol === "vendedor" && (tipo === "entrada" || tipo === "baja");

      try {
        if (requiereAprobacion) {
          await solicitudesMovimientoApi.crear({
            id_producto: Number(data.id_producto),
            tipo,
            cantidad: Number(data.cantidad),
            motivo: data.motivo || undefined,
            observacion: data.observacion || undefined,
          });
          toast(
            `📋 ${tipo === "entrada" ? "Entrada" : "Baja"} enviada para aprobación del administrador`,
            "warn",
            4500
          );
          form.reset();
          return;
        }

        // Flujo directo (admin/bodeguero registran al instante)
        const resp = await movimientosService.registrar(tipo, data);
        toast(
          `✅ ${resp.mensaje} · Stock: ${resp.stock_anterior} → ${resp.stock_nuevo}`,
          "ok"
        );
        form.reset();

        // Refrescar productos (los stocks cambiaron) y movimientos
        const prods = await movimientosService.getProductos().catch(() => []);
        productos = prods;
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
        toast(`❌ ${err.message || "Error al registrar"}`, "error");
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
      // Actualizar contador de la tab Historial con la cantidad real cargada
      const conteoTab = document.querySelector('.mov-tab--historial .mov-tab__conteo');
      if (conteoTab) conteoTab.textContent = String(movimientos.length);
    } catch (err) {
      logger.error({ err }, "Error cargando movimientos");
      movimientosView.setEstado(estado, "💥 Error al conectar con el servidor.");
    }
  }

  /**
   * Carga las solicitudes del empleado actual, las renderiza y conecta
   * el botón "Cancelar" de cada fila pendiente.
   */
  function conectarMisSolicitudes() {
    const tablaSolic = document.getElementById("tablaMisSolicitudes");
    const estadoSolic = document.getElementById("estadoMisSolicitudes");
    if (!tablaSolic) return;

    async function cargarMisSolicitudes() {
      movimientosView.setEstado(estadoSolic, "⏳ Cargando tus solicitudes...");
      try {
        const solicitudes = await solicitudesMovimientoApi.getMias();
        movimientosView.renderMisSolicitudes(solicitudes, tablaSolic, estadoSolic);
      } catch (err) {
        logger.error({ err }, "Error cargando mis solicitudes");
        movimientosView.setEstado(estadoSolic, "💥 No se pudieron cargar tus solicitudes");
      }
    }

    // Click delegado sobre el botón Cancelar de cada fila
    tablaSolic.addEventListener("click", async (e) => {
      const btn = e.target.closest(".mis-solicitudes__cancelar");
      if (!btn) return;
      const id = btn.dataset.id;
      if (!confirm("¿Cancelar esta solicitud pendiente?")) return;
      btn.disabled = true;
      try {
        await solicitudesMovimientoApi.cancelar(id);
        toast("✅ Solicitud cancelada", "ok");
        await cargarMisSolicitudes();
      } catch (err) {
        toast(`❌ ${err.message || "No se pudo cancelar"}`, "error");
        btn.disabled = false;
      }
    });

    // Cargar cuando el usuario activa el tab (lazy) o ahora si está activo
    const tab = document.querySelector('.mov-tab[data-tab="mis-solicitudes"]');
    if (tab) {
      tab.addEventListener("click", cargarMisSolicitudes);
    }
    // Carga inicial silenciosa para que el conteo del tab esté correcto
    cargarMisSolicitudes();
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
