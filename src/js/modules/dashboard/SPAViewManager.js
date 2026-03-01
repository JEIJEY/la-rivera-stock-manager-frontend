// ======================================================
// 📦 src/js/modules/dashboard/SPAViewManager.js
// Gestor SPA universal para el Dashboard de La Rivera
// ======================================================

import { appEvents } from "../../core/EventBus.js";

/**
 * Gestor de vistas para el Dashboard SPA.
 * Encargado de:
 *  - Cargar el HTML de cada vista (fetch)
 *  - Hacer lazy-loading del módulo JS correspondiente
 *  - Llamar su función de inicialización
 *  - Emitir un evento global "vista-cargada"
 */
export default class SPAViewManager {
  constructor({ container, pagesBase = "./dashboard/" } = {}) {
    if (!container) throw new Error("SPAViewManager: container requerido");
    this.container = container;
    this.pagesBase = pagesBase;
    this.registry = new Map();
    this.currentView = null;

    // 🌀 Loader global
    this.loader = document.getElementById("spaLoader");

    console.log("🧭 SPAViewManager inicializado correctamente");
  }

  // ======================================================
  // 🔧 REGISTRO DE VISTAS DISPONIBLES
  // ======================================================
  initializeDefaults() {
    this.register("inventario", {
      html: "inventario_dashboard.html",
      module: "./inventario.js",
      initExport: "inicializarInventario",
    });

    this.register("productos", {
      html: "productos.html",
      module: "./inventario.js",
      initExport: "inicializarInventario",
    });

    this.register("categorias", {
      html: "categorias.html",
      module: "./categorias.js",
      initExport: "inicializarCategorias",
    });

    this.register("usuarios", {
      html: "usuarios.html",
      module: "./usuarios.js",
      initExport: "inicializarUsuarios",
    });

    this.register("reportes", {
      html: "reportes.html",
      module: "./reportes.js",
      initExport: "inicializarReportes",
    });

    this.register("configuracion", {
      html: "configuracion.html",
      module: "./configuracion.js",
      initExport: "inicializarConfiguracion",
    });

    console.log(`📚 Vistas registradas: ${[...this.registry.keys()].join(", ")}`);
  }

  // ======================================================
  // 🧩 REGISTRAR UNA VISTA INDIVIDUAL
  // ======================================================
  register(name, { html, module, initExport = "inicializarVista", beforeLoad, afterLoad }) {
    this.registry.set(name, { html, module, initExport, beforeLoad, afterLoad, _modCache: null });
  }

  // ======================================================
  // 🚀 CARGAR UNA VISTA (HTML + JS)
  // ======================================================
  async load(name) {
    const entry = this.registry.get(name);
    if (!entry) return console.error(`Vista "${name}" no registrada`);

    console.log(`🧭 Navegando a vista: ${name}`);

    try {
      this.mostrarLoader(true);

      if (entry.beforeLoad) await entry.beforeLoad();

      await this.fadeOut(this.container);

      // 1️⃣ Cargar HTML de la vista
      const resp = await fetch(this.pagesBase + entry.html, { cache: "no-cache" });
      if (!resp.ok) throw new Error(`Error al cargar ${entry.html}`);
      const html = await resp.text();
      this.container.innerHTML = html;

      // 2️⃣ Lazy load del módulo JS
      const mod = entry._modCache || await import(/* @vite-ignore */ entry.module);
      entry._modCache = mod;

      // 3️⃣ Llamar a la función de inicialización
      const initFn = mod[entry.initExport];
      if (typeof initFn !== "function") {
        throw new Error(`El módulo ${entry.module} no exporta ${entry.initExport}`);
      }

      await initFn();
      this.currentView = name;

      await this.fadeIn(this.container);

      if (entry.afterLoad) await entry.afterLoad();
      appEvents.emit("vista-cargada", name);

      console.log(`✅ Vista "${name}" cargada correctamente`);
    } catch (err) {
      console.error(`❌ Error al cargar vista "${name}":`, err);
      this.container.innerHTML = `<div class="error">Error al cargar ${name}</div>`;
    } finally {
      this.mostrarLoader(false);
    }
  }

  // ======================================================
  // 🎡 LOADER GLOBAL (mostrar / ocultar)
  // ======================================================
  mostrarLoader(activo) {
    if (!this.loader) return;
    this.loader.classList.toggle("active", activo);
  }

  // ======================================================
  // ✨ EFECTOS DE TRANSICIÓN (FADE)
  // ======================================================
  async fadeOut(element) {
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = 1;
    await new Promise((r) =>
      requestAnimationFrame(() => {
        element.style.opacity = 0;
        setTimeout(r, 300);
      })
    );
  }

  async fadeIn(element) {
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = 0;
    await new Promise((r) =>
      requestAnimationFrame(() => {
        element.style.opacity = 1;
        setTimeout(r, 300);
      })
    );
  }

  // ======================================================
  // ⚡ PREFETCH (precarga opcional)
  // ======================================================
  async prefetchModule(name) {
    const entry = this.registry.get(name);
    if (!entry || entry._modCache) return;
    try {
      entry._modCache = await import(/* @vite-ignore */ entry.module);
      console.log(`📦 Prefetch exitoso: ${name}`);
    } catch {
      console.warn(`⚠️ No se pudo precargar ${name}`);
    }
  }
}