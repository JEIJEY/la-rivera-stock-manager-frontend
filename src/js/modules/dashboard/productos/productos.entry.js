import logger from "../../../core/logger.js";
import { productosService } from "./productos.service.js";
import { productosView } from "./productos.view.js";

export async function inicializarInventario() {
  logger.info("Inicializando vista de productos...");

  const tabla = document.getElementById("tablaProductos");
  const estado = document.getElementById("estadoCarga");
  const btnRecargar = document.getElementById("btnRecargar");
  const btnCrear = document.getElementById("btnCrearProducto");
  const hostModal = document.getElementById("modalHostProductos");

  if (!tabla || !estado) {
    logger.warn("Elementos del DOM de productos no encontrados");
    return;
  }

  await cargarProductos();

  if (btnRecargar && !btnRecargar.dataset.listener) {
    btnRecargar.dataset.listener = "true";
    btnRecargar.addEventListener("click", cargarProductos);
  }

  if (btnCrear && !btnCrear.dataset.listener) {
    btnCrear.dataset.listener = "true";
    btnCrear.addEventListener("click", () => abrirModal(hostModal, cargarProductos));
  }

  async function cargarProductos() {
    productosView.setEstado(estado, "⏳ Cargando productos...");
    try {
      const productos = await productosService.getAll();
      productosView.renderTabla(productos, tabla, estado);
    } catch (err) {
      logger.error({ err }, "Error cargando productos");
      productosView.setEstado(estado, "💥 Error al conectar con el servidor.");
    }
  }
}

async function abrirModal(hostModal, onSuccess) {
  const modalId = "modalProductoInventario";

  if (!document.getElementById(modalId)) {
    try {
      const res = await fetch("/src/pages/dashboard/modal-producto.html");
      if (!res.ok) throw new Error("No se encontró modal-producto.html");
      hostModal.innerHTML = await res.text();
    } catch (err) {
      logger.error({ err }, "Error cargando modal");
      alert("No se pudo cargar el modal.");
      return;
    }
  }

  const modal = document.getElementById(modalId);
  if (!modal) return;

  productosView.mostrarModal(modal);
  await cargarSelects();
  conectarModal(modal, onSuccess);
}

async function cargarSelects() {
  try {
    const { categorias, marcas, proveedores } = await productosService.getSelectsData();
    productosView.renderSelect(
      document.getElementById("categoria"), categorias, "id_categoria", "nombre", "Seleccione una categoría"
    );
    productosView.renderSelect(
      document.getElementById("marca"), marcas, "id_marca", "nombre", "Seleccione una marca"
    );
    productosView.renderSelect(
      document.getElementById("proveedor"), proveedores, "id_proveedor", "nombre", "Seleccione un proveedor"
    );
  } catch (err) {
    logger.error({ err }, "Error cargando selects");
  }
}

function conectarModal(modal, onSuccess) {
  const form = document.getElementById("formProducto");
  const btnCancelar = document.getElementById("cancelarModal");

  btnCancelar?.addEventListener("click", () => productosView.ocultarModal(modal));

  modal.addEventListener("click", (e) => {
    if (e.target === modal) productosView.ocultarModal(modal);
  });

  if (form && !form.dataset.listener) {
    form.dataset.listener = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        stock: parseInt(document.getElementById("stock").value || 0),
        unidad_medida: document.getElementById("unidad").value.trim(),
        precio_unitario: parseFloat(document.getElementById("precio").value || 0),
        id_categoria: parseInt(document.getElementById("categoria").value),
        id_marca: parseInt(document.getElementById("marca").value),
        id_proveedor: parseInt(document.getElementById("proveedor").value),
        estado: parseInt(document.getElementById("estado").value),
      };
      try {
        await productosService.crear(data);
        alert("✅ Producto creado correctamente");
        productosView.ocultarModal(modal);
        await onSuccess();
      } catch (err) {
        alert("❌ " + err.message);
      }
    });
  }

  document.addEventListener("change", async (e) => {
    const tipos = { categoria: "categorias", marca: "marcas", proveedor: "proveedores" };
    const tipo = tipos[e.target.id];
    if (tipo && e.target.value === "crear-nueva") {
      const nombre = prompt("Ingrese el nombre:");
      if (!nombre) { e.target.value = ""; return; }
      try {
        const { data, idCampo } = await productosService.crearDesdeSelect(tipo, nombre);
        alert("✅ Creado correctamente");
        await cargarSelects();
        e.target.value = data[idCampo];
      } catch (err) {
        alert("❌ " + err.message);
        e.target.value = "";
      }
    }
  });
}