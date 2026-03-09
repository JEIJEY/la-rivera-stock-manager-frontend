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
  conectarModal();

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

function abrirModal(categoriaId, categoriaNombre) {
  document.getElementById("modalCategoriaNombre").textContent = categoriaNombre || "";
  document.getElementById("modalCategoriaId").value = categoriaId;
  document.getElementById("formProducto").reset();
  document.getElementById("modalProducto").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalProducto").style.display = "none";
}

function conectarModal() {
  const formProducto = document.getElementById("formProducto");
  if (!formProducto || formProducto.dataset.listener) return;
  formProducto.dataset.listener = "true";

  formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const categoriaId = document.getElementById("modalCategoriaId").value;
    const data = {
      nombre: document.getElementById("productoNombre").value.trim(),
      descripcion: document.getElementById("productoDescripcion").value.trim(),
      precio_unitario: parseFloat(document.getElementById("productoPrecio").value),
      stock: parseInt(document.getElementById("productoStock").value),
      unidad_medida: document.getElementById("productoUnidad").value,
      id_marca: document.getElementById("productoMarca").value || null,
      id_proveedor: document.getElementById("productoProveedor").value || null,
      estado: parseInt(document.getElementById("productoEstado").value),
      id_categoria: categoriaId,
    };

    try {
      await categoriasService.crearProducto(data);
      cerrarModal();
      const detalle = await categoriasService.getDetalle(categoriaId);
      categoriasView.renderDetalle(detalle);
      alert("✅ Producto agregado correctamente");
    } catch (err) {
      alert("❌ " + err.message);
    }
  });

  const modal = document.getElementById("modalProducto");
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
    if (e.target.closest("[data-action='cerrar-modal']")) cerrarModal();
  });
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
    const { action, id, nombre } = btn.dataset;

    if (action === "detalle") await abrirDetalle(id, nombre);

    if (action === "volver") categoriasView.mostrarVista("raiz");

    if (action === "nueva-subcategoria") {
      const subNombre = prompt("Nombre de la subcategoría:");
      if (!subNombre) return;
      const subDesc = prompt("Descripción (opcional):") || "";
      try {
        await categoriasService.crear(subNombre, subDesc, categoriaActualId);
        const detalle = await categoriasService.getDetalle(categoriaActualId);
        categoriasView.renderDetalle(detalle);
        alert("✅ Subcategoría creada correctamente");
      } catch (err) {
        alert("❌ " + err.message);
      }
    }

    if (action === "agregar-producto") {
      try {
        const { marcas, proveedores } = await categoriasService.getMarcasYProveedores();
        categoriasView.renderMarcas(marcas);
        categoriasView.renderProveedores(proveedores);
      } catch (err) {
        logger.warn("Error cargando marcas/proveedores:", err.message);
      }
      const tituloCat = document.getElementById("detalleNombre")?.textContent || "";
      abrirModal(categoriaActualId, tituloCat);
    }

    if (action === "cerrar-modal") cerrarModal();
  });
}