import logger from "../../core/logger.js";
import SPAViewManager from "./SPAViewManager.js";
import { appEvents } from "../../core/EventBus.js";
import { initLogoutButton } from "../../shared/components/logout-button.js";
import { initTheme, initThemeToggle } from "../../shared/theme.js";

// Importar módulos estáticamente
import * as inventarioModule from "./inventario/inventario.entry.js";
import * as productosModule from "./productos/productos.entry.js";
import * as categoriasModule from "./categorias/categorias.entry.js";
import * as usuariosModule from "./usuarios/usuarios.entry.js";
import * as reportesModule from "./reportes/reportes.entry.js";
import * as movimientosModule from "./movimientos/movimientos.entry.js";
import * as configuracionModule from "./configuracion/configuracion.entry.js";
import { inicializarABC } from "./abc/abc.entry.js";

/**
 * Inicializa el Dashboard SPA.
 * Debe llamarse DESPUÉS de que renderDashboard() haya insertado el HTML en el DOM.
 */
export async function inicializarDashboard() {
  const main = document.querySelector(".dashboard-main");
  if (!main) {
    logger.error("❌ Dashboard: no se encontró elemento .dashboard-main");
    return;
  }

  const viewManager = new SPAViewManager({
    container: main,
    pagesBase: "/pages/dashboard/",
  });

  viewManager.register("inventario", {
    html: "inventario_dashboard.html",
    module: inventarioModule,
    initExport: "inicializarInventario",
    afterLoad: async () => {
      await inicializarABC();
    },
  });

  viewManager.register("productos", {
    html: "productos.html",
    module: productosModule,
    initExport: "inicializarInventario",
  });

  viewManager.register("categorias", {
    html: "categorias.html",
    module: categoriasModule,
    initExport: "inicializarCategorias",
  });

  viewManager.register("usuarios", {
    html: "usuarios.html",
    module: usuariosModule,
    initExport: "inicializarUsuarios",
  });

  viewManager.register("reportes", {
    html: "en-construccion.html",
    module: reportesModule,
    initExport: "inicializarReportes",
  });

  viewManager.register("movimientos", {
    html: "movimientos.html",
    module: movimientosModule,
    initExport: "inicializarMovimientos",
  });

  viewManager.register("configuracion", {
    html: "configuracion.html",
    module: configuracionModule,
    initExport: "inicializarConfiguracion",
  });

  document.querySelectorAll(".sidebar-menu__link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const seccion = link.dataset.seccion;
      if (seccion) viewManager.load(seccion);
    });

    link.addEventListener("mouseenter", () => {
      const seccion = link.dataset.seccion;
      if (seccion) viewManager.prefetchModule(seccion);
    });
  });

  // ── Poblar perfil del sidebar con datos reales del token ────────────
  actualizarPerfilSidebar();

  // ── Ocultar secciones del sidebar según rol ──────────────────────────
  const SECCIONES_OCULTAS_POR_ROL = {
    vendedor:  ["usuarios", "reportes", "configuracion"],
    bodeguero: ["usuarios", "configuracion"],
    pendiente: ["usuarios", "reportes", "configuracion"],
  };
  const rolActual = obtenerRolDesdeToken();
  const seccionesOcultas = SECCIONES_OCULTAS_POR_ROL[rolActual] ?? [];
  seccionesOcultas.forEach((seccion) => {
    const link = document.querySelector(`.sidebar-menu__link[data-seccion="${seccion}"]`);
    if (link) link.closest(".sidebar-menu__item").style.display = "none";
  });

  logger.info("Cargando vista inicial...");
  await viewManager.load("inventario");
  initLogoutButton();
  initTheme();        // Aplica tema guardado al cargar dashboard
  initThemeToggle();  // Adjunta listener al toggle del header

  // Adjuntar listeners después de que todo esté inicializado
  appEvents.on("vista-cargada", (vista) => {
    logger.info({ vista }, "Vista activa");
    inicializarToggleInventario();
  });
}

/** Actualiza nombre y rol del perfil en el sidebar usando el JWT. */
function actualizarPerfilSidebar() {
  const ETIQUETA_ROL = {
    admin:       "Administrador",
    propietario: "Propietario",
    bodeguero:   "Bodeguero",
    vendedor:    "Vendedor",
    pendiente:   "Sin rol asignado",
  };

  const payload = obtenerPayloadToken();
  if (!payload) return;

  const elNombre = document.querySelector(".db-sidebar__name");
  const elRol    = document.querySelector(".db-sidebar__role");

  if (elNombre && payload.nombre) {
    elNombre.textContent = payload.nombre.toUpperCase();
  } else if (elNombre && payload.email) {
    elNombre.textContent = payload.email;
  }

  if (elRol && payload.rol) {
    elRol.textContent = ETIQUETA_ROL[payload.rol] ?? payload.rol;
  }
}

/** Lee el payload completo del JWT en localStorage sin verificar firma. */
function obtenerPayloadToken() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

/** Lee el campo `rol` del JWT en localStorage sin verificar firma. */
function obtenerRolDesdeToken() {
  return obtenerPayloadToken()?.rol ?? null;
}

function inicializarToggleInventario() {
  const toggle = document.getElementById("inventarioToggle");
  if (!toggle || toggle.dataset.listener) return;

  toggle.dataset.listener = "true";
  const item = toggle.closest(".sidebar-menu__item");

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    item.classList.toggle("open");
  });
}