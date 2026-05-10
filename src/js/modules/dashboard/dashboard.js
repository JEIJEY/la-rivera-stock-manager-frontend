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
import * as aprobacionesModule from "./aprobaciones/aprobaciones.entry.js";
import { inicializarABC } from "./abc/abc.entry.js";
import { montarCampana } from "./shared/notificaciones.bell.js";
import { solicitudesMovimientoApi } from "./shared/solicitudesMovimiento.api.js";

/**
 * Inicializa el Dashboard SPA.
 * Debe llamarse DESPUÉS de que renderDashboard() haya insertado el HTML en el DOM.
 */
// Guard global: previene doble inicialización del dashboard.
// Si por cualquier razón (HMR, doble loadRoute, etc.) se intenta inicializar
// dos veces sobre el mismo DOM, los listeners se acumularían en bell, sidebar,
// etc. Este flag aborta la segunda inicialización.
let _dashboardInicializado = false;

export async function inicializarDashboard() {
  const main = document.querySelector(".dashboard-main");
  if (!main) {
    logger.error("❌ Dashboard: no se encontró elemento .dashboard-main");
    return;
  }

  // Si ya está inicializado sobre este mismo `main`, abortar.
  if (_dashboardInicializado && main.dataset.dashboardInit === "true") {
    logger.warn("⚠️ Dashboard ya inicializado — se omite re-inicialización");
    return;
  }
  _dashboardInicializado = true;
  main.dataset.dashboardInit = "true";

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

  viewManager.register("aprobaciones", {
    html: "aprobaciones.html",
    module: aprobacionesModule,
    initExport: "inicializarAprobaciones",
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
  // Aprobaciones: solo admin/propietario lo ven
  const SECCIONES_OCULTAS_POR_ROL = {
    vendedor:  ["usuarios", "reportes", "configuracion", "aprobaciones"],
    bodeguero: ["usuarios", "configuracion", "aprobaciones"],
    pendiente: ["usuarios", "reportes", "configuracion", "aprobaciones"],
  };
  const rolActual = obtenerRolDesdeToken();
  const seccionesOcultas = SECCIONES_OCULTAS_POR_ROL[rolActual] ?? [];
  seccionesOcultas.forEach((seccion) => {
    const link = document.querySelector(`.sidebar-menu__link[data-seccion="${seccion}"]`);
    if (link) link.closest(".sidebar-menu__item").style.display = "none";
  });

  logger.info("Cargando vista inicial...");
  const esVistaValida = (v) =>
    v && viewManager.registry.has(v) && !seccionesOcultas.includes(v);

  const vistaHash = viewManager.leerHashActual();

  let vistaInicial;
  if (rolActual === "vendedor") {
    // Vendedor: Movimientos es SU vista principal — solo un hash explícito lo cambia
    vistaInicial = esVistaValida(vistaHash) ? vistaHash : "movimientos";
  } else {
    // Otros roles: hash → última vista guardada → default
    const vistaUltima = (() => {
      try { return localStorage.getItem("dashboard:ultimaVista"); } catch { return null; }
    })();
    vistaInicial =
      (esVistaValida(vistaHash) && vistaHash) ||
      (esVistaValida(vistaUltima) && vistaUltima) ||
      "inventario";
  }

  await viewManager.load(vistaInicial);
  initLogoutButton();
  initTheme();        // Aplica tema guardado al cargar dashboard
  initThemeToggle();  // Adjunta listener al toggle del header

  // ── Campana de notificaciones (todos los roles autenticados) ─────────
  const contenedorCampana = document.getElementById("campanaNotificaciones");
  if (contenedorCampana) montarCampana(contenedorCampana);

  // ── Badge de pendientes en sidebar (solo admin/propietario) ─────────
  if (rolActual === "admin" || rolActual === "propietario") {
    iniciarBadgeAprobaciones();
  }

  // Adjuntar listeners después de que todo esté inicializado
  appEvents.on("vista-cargada", (vista) => {
    logger.info({ vista }, "Vista activa");
    inicializarToggleInventario();
  });
}

/** Polling del conteo de aprobaciones pendientes (solo para admin/propietario). */
function iniciarBadgeAprobaciones() {
  const badge = document.getElementById("badgeAprobaciones");
  if (!badge) return;

  const actualizar = async () => {
    try {
      const pendientes = await solicitudesMovimientoApi.getPendientes();
      const n = Array.isArray(pendientes) ? pendientes.length : 0;
      if (n > 0) {
        badge.textContent = n > 99 ? "99+" : String(n);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (_) {
      // silencioso — endpoint puede no estar disponible
    }
  };

  actualizar();
  // Polling cada 30s, pausa cuando la pestaña está oculta
  let timer = setInterval(actualizar, 30_000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearInterval(timer); timer = null; }
    else if (!timer) { actualizar(); timer = setInterval(actualizar, 30_000); }
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