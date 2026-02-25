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
} from "../utilities/debugGrid.js";

// ======================================================
// ⚙️ INTEGRACIÓN DEL GESTOR SPA (Single Page Application)
// ======================================================
import SPAViewManager from "./SPAViewManager.js";
import { appEvents } from "../utilities/EventBus.js";

// 1️⃣ Inicializamos el gestor de vistas
const viewManager = new SPAViewManager({
  container: main,
  pagesBase: "./dashboard/", // HTMLs dentro de /pages/dashboard/
});

// 2️⃣ Registramos todas las vistas del dashboard
viewManager.register("inventario", {
  html: "inventario_dashboard.html",
  module: "../../js/dashboard/inventario.js",
  initExport: "inicializarInventario",
  afterLoad: async () => {
    // Al cargar el inventario, inyecta el módulo ABC y observa la grilla
    await cargarABCparaInventario();
    observarRedimensionamiento();
  },
});

// 🆕 Vista “Productos” — usa el mismo módulo inventario.js
viewManager.register("productos", {
  html: "productos.html",
  module: "../../js/dashboard/inventario.js",
  initExport: "inicializarInventario",
});

// Vista “Categorías”
viewManager.register("categorias", {
  html: "categorias.html",
  module: "../../js/dashboard/categorias.js",
  initExport: "inicializarCategorias",
});

// Vista “Usuarios”
viewManager.register("usuarios", {
  html: "usuarios.html",
  module: "../../js/dashboard/usuarios.js",
  initExport: "inicializarUsuarios",
});

// Vista “Reportes”
viewManager.register("reportes", {
  html: "reportes.html",
  module: "../../js/dashboard/reportes.js",
  initExport: "inicializarReportes",
});

// Vista “Configuración”
viewManager.register("configuracion", {
  html: "configuracion.html",
  module: "../../js/dashboard/configuracion.js",
  initExport: "inicializarConfiguracion",
});

// ======================================================
// 🧭 NAVEGACIÓN DINÁMICA DEL DASHBOARD
// ======================================================
// Todos los enlaces del sidebar que tengan data-seccion
document.querySelectorAll(".sidebar-menu__link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const seccion = link.dataset.seccion;
    if (seccion) {
      console.log(`🧭 Navegando a vista: ${seccion}`);
      viewManager.load(seccion);
    }
  });

  // 🪄 Precarga el módulo al pasar el mouse (para carga instantánea)
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
// 🚀 CARGA ESPECÍFICA PARA EL MÓDULO ABC (Análisis de Inventario)
// ======================================================
async function cargarABCparaInventario() {
  console.log("🔄 Iniciando carga de ABC...");

  return new Promise((resolve) => {
    // Evita recargar si ya está disponible
    if (window.recalcularABC && window.filtrarProductos) {
      console.log("⚡ ABC.js ya estaba cargado");
      return resolve();
    }

    const script = document.createElement("script");
    script.src = "/src/js/dashboard/abc.js"; // Ruta absoluta (segura)
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
// 🧠 EVENTO GLOBAL DEL GESTOR SPA (debug opcional)
// ======================================================
appEvents.on("vista-cargada", (vista) => {
  console.log(`📄 Vista activa: ${vista}`);
});
