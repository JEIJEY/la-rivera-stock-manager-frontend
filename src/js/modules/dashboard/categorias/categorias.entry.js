import logger from "../../../core/logger.js";
import { categoriasService } from "./categorias.service.js";
import { categoriasView } from "./categorias.view.js";
import { appEvents } from "../../../core/EventBus.js";

let categoriaActualId = null;

export async function inicializarCategorias() {
  logger.info("Inicializando categorías...");

  const lista = document.getElementById("listaCategorias");
  if (!lista) {
    logger.warn("No se encontró #listaCategorias");
    return;
  }

  await cargarCategorias();
  conectarFormulario();
  conectarEventosDelegados();

  logger.info("Categorías inicializadas correctamente");
}

async function cargarCategorias() {
  try {
    const categorias = await categoriasService.getCategorias();
    const lista = document.getElementById("listaCategorias");
    categoriasView.renderLista(categorias, lista);
  } catch (err) {
    logger.error({ err }, "Error cargando categorías");
  }
}

async function abrirDetalle(id, nombre) {
  categoriaActualId = id;
  try {
    const detalle = await categoriasService.getDetalle(id);
    categoriasView.renderDetalle(detalle);
    categoriasView.mostrarVista("detalle");
  } catch (err) {
    logger.error({ err }, "Error abriendo detalle");
  }
}

function conectarFormulario() {
  const form = document.getElementById("formCategoria");
  if (!form || form.dataset.listener) return;
  form.dataset.listener = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    try {
      await categoriasService.crear(nombre, descripcion);
      form.reset();
      await cargarCategorias();
      appEvents.emit("categoria:creada", { nombre });
      alert("✅ Categoría creada correctamente");
    } catch (err) {
      alert("❌ " + err.message);
    }
  });
}

function conectarEventosDelegados() {
  const lista = document.getElementById("listaCategorias");
  const detalleContainer = document.getElementById("vistaDetalle");

  lista?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const { action, id, nombre, desc } = btn.dataset;

    if (action === "detalle") await abrirDetalle(id, nombre);

    if (action === "subcategoria") {
      const subNombre = prompt(`Nombre de la subcategoría dentro de "${nombre}":`);
      if (!subNombre) return;
      const subDesc = prompt("Descripción (opcional):") || "";
      try {
        await categoriasService.crear(subNombre, subDesc, id);
        await cargarCategorias();
        alert("✅ Subcategoría creada correctamente");
      } catch (err) {
        alert("❌ " + err.message);
      }
    }

    if (action === "editar") {
      const nuevoNombre = prompt("Nuevo nombre:", nombre);
      if (nuevoNombre === null) return;
      const nuevaDesc = prompt("Nueva descripción:", desc);
      try {
        await categoriasService.actualizar(id, nuevoNombre, nuevaDesc);
        await cargarCategorias();
        appEvents.emit("categoria:actualizada", { id, nombre: nuevoNombre });
        alert("✅ Categoría actualizada correctamente");
      } catch (err) {
        alert("❌ " + err.message);
      }
    }

    if (action === "eliminar") {
      if (!confirm("¿Seguro de eliminar esta categoría?")) return;
      try {
        await categoriasService.eliminar(id);
        await cargarCategorias();
        appEvents.emit("categoria:eliminada", { id });
        alert("✅ Categoría eliminada correctamente");
      } catch (err) {
        alert("❌ " + (err.message.includes("400")
          ? "No se puede eliminar: tiene productos asociados."
          : err.message));
      }
    }
  });

  detalleContainer?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "detalle") {
      await abrirDetalle(btn.dataset.id, btn.dataset.nombre);
    }
    if (btn.dataset.action === "volver") {
      categoriasView.mostrarVista("raiz");
    }
  });
}