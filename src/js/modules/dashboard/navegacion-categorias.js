// ✅ NAVEGACIÓN DE CATEGORÍAS - VERSIÓN SIN DEPENDENCIAS CIRCULARES
import apiClient from "../utilities/apiClient.js";
import { mostrarProductos } from "./productos-vista.js";

console.log("🎯 NAVEGACIÓN DE CATEGORÍAS: Módulo cargado");

const state = {
  rutaActual: [],
  categoriaActual: null,
  nivelActual: 0,
};

export const NavegacionCategorias = {
  init() {
    console.log("🎯 NAVEGACIÓN DE CATEGORÍAS: Inicializando...");

    this.$breadcrumbs = document.getElementById("breadcrumbs");
    this.$btnVolver = document.getElementById("btnVolver");
    this.$vista = document.getElementById("vistaCategorias");
    this.$vistaRaiz = document.getElementById("vistaRaiz");
    this.$vistaNavegacion = document.getElementById("vistaNavegacion");

    if (!this.$breadcrumbs || !this.$btnVolver || !this.$vista || !this.$vistaRaiz || !this.$vistaNavegacion) {
      console.warn("⚠️ Elementos de navegación no encontrados");
      return;
    }

    this.$btnVolver.addEventListener("click", () => this.volver());
    this.$breadcrumbs.addEventListener("click", (e) => this.handleBreadcrumb(e));

    // Inicializar la vista según el nivel actual (0)
    this.actualizarVistaModo();
    this.renderBreadcrumbs();
    this.updateVolverButton();

    // 🔥 Cargar categorías raíz (pero no en nivel 0, porque el CRUD ya muestra las categorías)
    // En nivel 0, no cargamos nada en la vista de navegación, porque mostramos el CRUD.
    // Pero si queremos pre-cargar las categorías raíz para la navegación, podríamos hacerlo.
    // Sin embargo, note que el CRUD ya carga las categorías en la vistaRaiz.
    // Por lo tanto, no necesitamos cargar categorías raíz en la vista de navegación en el nivel 0.
  },

  // =====================================================
  // 🔹 Actualizar vista modo (CRUD vs Navegación)
  // =====================================================
  actualizarVistaModo() {
    if (state.nivelActual === 0) {
      this.$vistaRaiz.style.display = "block";
      this.$vistaNavegacion.style.display = "none";
    } else {
      this.$vistaRaiz.style.display = "none";
      this.$vistaNavegacion.style.display = "block";
    }
  },

  // =====================================================
  // 🔹 Cargar categorías o productos según parentId
  // =====================================================
  async cargarNivel(parentId = null) {
    try {
      const categorias = await apiClient.getCategorias(parentId);

      // ✅ Si la categoría actual NO tiene subcategorías → mostrar productos
      if (!categorias || categorias.length === 0) {
        if (state.categoriaActual) {
          await mostrarProductos(state.categoriaActual.id, state.categoriaActual.nombre);
          return;
        } else {
          this.$vista.innerHTML = `<p class="no-items">No hay categorías registradas.</p>`;
          return;
        }
      }

      // 🔁 Si sí tiene subcategorías → renderiza el nivel
      this.renderVista(categorias);

    } catch (err) {
      console.error("❌ Error cargando nivel:", err);
      this.$vista.innerHTML = `<p class="error">Error al cargar las categorías.</p>`;
    }
  },

  // =====================================================
  // 🔹 Renderizar el listado de subcategorías
  // =====================================================
  renderVista(categorias) {
    this.$vista.innerHTML = categorias
      .map(
        (c) => `
        <div class="cat-item" data-id="${c.id_categoria}">
          <span>${c.nombre}</span>
        </div>`
      )
      .join("");

    // Click en una categoría → navegar un nivel más
    this.$vista.querySelectorAll(".cat-item").forEach((el) =>
      el.addEventListener("click", () =>
        this.irASubcategoria(el.dataset.id, el.textContent)
      )
    );
  },

  // =====================================================
  // 🔹 Navegar hacia abajo
  // =====================================================
  async irASubcategoria(id, nombre) {
    state.rutaActual.push({ id, nombre });
    state.categoriaActual = { id, nombre };
    state.nivelActual++;
    this.actualizarVistaModo();
    this.renderBreadcrumbs();
    this.updateVolverButton();
    await this.cargarNivel(id);
  },

  // =====================================================
  // 🔹 Volver un nivel arriba
  // =====================================================
  async volver() {
    if (state.nivelActual === 0) return;
    state.rutaActual.pop();
    state.categoriaActual = state.rutaActual[state.rutaActual.length - 1] || null;
    state.nivelActual = Math.max(0, state.nivelActual - 1);
    this.actualizarVistaModo();
    this.renderBreadcrumbs();
    this.updateVolverButton();
    await this.cargarNivel(state.categoriaActual ? state.categoriaActual.id : null);
  },

  // =====================================================
  // 🔹 Breadcrumbs
  // =====================================================
  renderBreadcrumbs() {
    const partes = [
      { label: "Inicio", index: -1, isCurrent: state.nivelActual === 0 },
      ...state.rutaActual.map((r, i) => ({
        label: r.nombre,
        index: i,
        isCurrent: i === state.rutaActual.length - 1,
      })),
    ];

    this.$breadcrumbs.innerHTML = partes
      .map((p) =>
        p.isCurrent
          ? `<span class="crumb current">${p.label}</span>`
          : `<button class="crumb" data-index="${p.index}">${p.label}</button>`
      )
      .join(`<span class="crumb-sep">›</span>`);
  },

  updateVolverButton() {
    this.$btnVolver.disabled = state.nivelActual === 0;
  },

  // =====================================================
  // 🔹 Clic en breadcrumb
  // =====================================================
  async handleBreadcrumb(e) {
    const btn = e.target.closest("button.crumb");
    if (!btn) return;

    const index = Number(btn.dataset.index);
    if (index === -1) {
      state.rutaActual = [];
      state.categoriaActual = null;
      state.nivelActual = 0;
    } else {
      state.rutaActual = state.rutaActual.slice(0, index + 1);
      state.categoriaActual = state.rutaActual[state.rutaActual.length - 1];
      state.nivelActual = state.rutaActual.length;
    }

    this.actualizarVistaModo();
    this.renderBreadcrumbs();
    this.updateVolverButton();
    await this.cargarNivel(state.categoriaActual ? state.categoriaActual.id : null);
  },
};