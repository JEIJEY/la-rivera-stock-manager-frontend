// ======================================================
// DASHBOARD.JS - VERSIÓN MODULAR CON LAZY LOADING Y SPA MANAGER
// ======================================================

// 📦 Contenedor principal donde se inyectan las vistas dinámicas
const main = document.querySelector(".dashboard-main");

// ======================================================
// 🧩 UTILIDADES GLOBALES
// ======================================================
import {
  toggleGrilla,
  crearGrillaExacta,
  observarRedimensionamiento,
} from "../../shared/utils/debugGrid.js";

// ======================================================
// ⚙️ INTEGRACIÓN DEL GESTOR SPA (Single Page Application)
// ======================================================
import SPAViewManager from "./SPAViewManager.js";
import { appEvents } from "../../core/EventBus.js";

// 1️⃣ Inicializamos el gestor de vistas
const viewManager = new SPAViewManager({
  container: main,
  pagesBase: "./dashboard/",
});

// 2️⃣ Registramos todas las vistas del dashboard
viewManager.register("inventario", {
  html: "inventario_dashboard.html",
  module: "./inventario.js",
  initExport: "inicializarInventario",
  afterLoad: async () => {
    await cargarABCparaInventario();
    observarRedimensionamiento();
  },
});

viewManager.register("productos", {
  html: "productos.html",
  module: "./inventario.js",
  initExport: "inicializarInventario",
});

viewManager.register("categorias", {
  html: "categorias.html",
  module: "./categorias.js",
  initExport: "inicializarCategorias",
});

viewManager.register("usuarios", {
  html: "usuarios.html",
  module: "./usuarios.js",
  initExport: "inicializarUsuarios",
});

viewManager.register("reportes", {
  html: "reportes.html",
  module: "./reportes.js",
  initExport: "inicializarReportes",
});

viewManager.register("configuracion", {
  html: "configuracion.html",
  module: "./configuracion.js",
  initExport: "inicializarConfiguracion",
});

// ======================================================
// 🧭 NAVEGACIÓN DINÁMICA DEL DASHBOARD
// ======================================================
document.querySelectorAll(".sidebar-menu__link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const seccion = link.dataset.seccion;
    if (seccion) {
      console.log(`🧭 Navegando a vista: ${seccion}`);
      viewManager.load(seccion);
    }
  });

  link.addEventListener("mouseenter", () => {
    const seccion = link.dataset.seccion;
    if (seccion) viewManager.prefetchModule(seccion);
  });
});

// ======================================================
// 🚀 CARGA INICIAL DEL DASHBOARD
// ======================================================
(async () => {
  console.log("🚀 Cargando vista inicial (Inventario con ABC)...");
  await viewManager.load("inventario");
})();

// ======================================================
// 📂 CONTROL DEL SUBMENÚ DE INVENTARIO
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("inventarioToggle");
  if (!toggle) return;
  const item = toggle.closest(".sidebar-menu__item");

  toggle.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

// ======================================================
// 🎹 ATAJO DE TECLADO "G" → MOSTRAR / OCULTAR GRILLA DEBUG
// ======================================================
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "g") {
    toggleGrilla();
  }
});

// ======================================================
// 🚀 CARGA ESPECÍFICA PARA EL MÓDULO ABC
// ======================================================
async function cargarABCparaInventario() {
  console.log("🔄 Iniciando carga de ABC...");

  return new Promise((resolve) => {
    if (window.recalcularABC && window.filtrarProductos) {
      console.log("⚡ ABC.js ya estaba cargado");
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "/src/js/modules/dashboard/abc.js";
    script.type = "text/javascript";
    script.defer = true;

    script.onload = () => {
      console.log("✅ ABC.js cargado exitosamente");
      console.log("🧠 Funciones disponibles:", {
        recalcularABC: typeof window.recalcularABC,
        filtrarProductos: typeof window.filtrarProductos,
        cargarDatosABC: typeof window.cargarDatosABC,
      });
      resolve();
    };

    script.onerror = (error) => {
      console.error("❌ Error al cargar ABC.js:", error);
      resolve();
    };

    document.head.appendChild(script);
  });
}

// ======================================================
// 🧠 EVENTO GLOBAL DEL GESTOR SPA
// ======================================================
appEvents.on("vista-cargada", (vista) => {
  console.log(`📄 Vista activa: ${vista}`);
});