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
    html: "en-construccion.html",
    module: usuariosModule,
    initExport: "inicializarUsuarios",
  });

  viewManager.register("reportes", {
    html: "en-construccion.html",
    module: reportesModule,
    initExport: "inicializarReportes",
  });

  viewManager.register("movimientos", {
    html: "en-construccion.html",
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