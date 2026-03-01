import logger from "../../core/logger.js";
import SPAViewManager from "./SPAViewManager.js";
import { appEvents } from "../../core/EventBus.js";
import { initLogoutButton } from "../../shared/components/logout-button.js";

const main = document.querySelector(".dashboard-main");

const viewManager = new SPAViewManager({
  container: main,
  pagesBase: "/src/pages/dashboard/",
});

viewManager.register("inventario", {
  html: "inventario_dashboard.html",
  module: "./inventario/inventario.entry.js",
  initExport: "inicializarInventario",
  afterLoad: async () => {
    const { inicializarABC } = await import("./abc/abc.entry.js");
    await inicializarABC();
  },
});

viewManager.register("productos", {
  html: "productos.html",
  module: "./productos/productos.entry.js",
  initExport: "inicializarInventario",
});

viewManager.register("categorias", {
  html: "categorias.html",
  module: "./categorias/categorias.entry.js",
  initExport: "inicializarCategorias",
});

viewManager.register("usuarios", {
  html: "usuarios.html",
  module: "./usuarios/usuarios.entry.js",
  initExport: "inicializarUsuarios",
});

viewManager.register("reportes", {
  html: "reportes.html",
  module: "./reportes/reportes.entry.js",
  initExport: "inicializarReportes",
});

viewManager.register("movimientos", {
  html: "movimientos.html",
  module: "./movimientos/movimientos.entry.js",
  initExport: "inicializarMovimientos",
});

viewManager.register("configuracion", {
  html: "configuracion.html",
  module: "./configuracion/configuracion.entry.js",
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

(async () => {
  logger.info("Cargando vista inicial...");
  await viewManager.load("inventario");
  initLogoutButton();
})();

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

appEvents.on("vista-cargada", (vista) => {
  logger.info({ vista }, "Vista activa");
  inicializarToggleInventario();
});