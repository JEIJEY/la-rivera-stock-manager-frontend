// ======================================================
// ✅ CRUD COMPLETO CATEGORÍAS - VERSIÓN FINAL PARA SPAViewManager
// ======================================================

import apiClient from "../utilities/apiClient.js";
import { appEvents } from "../utilities/EventBus.js";
import { NavegacionCategorias } from "./navegacion-categorias.js";

console.log("🎯 Módulo de categorías (SPA) cargando...");

// ======================================================
// 🔧 FUNCIÓN PRINCIPAL DE INICIALIZACIÓN PARA SPAViewManager
// ======================================================
export async function inicializarCategorias() {
  console.log("📂 Inicializando vista de CATEGORÍAS (modo SPA)...");

  // 🔍 Referencias del DOM (ya inyectadas por SPAViewManager)
  const form = document.getElementById("formCategoria");
  const lista = document.getElementById("listaCategorias");

  if (!lista) {
    console.warn("⚠️ No se encontró el contenedor #listaCategorias");
    return;
  }

  // Inicializar módulo de navegación solo una vez
  if (!window._navCategoriasInicializado) {
    NavegacionCategorias.init();
    window._navCategoriasInicializado = true;
  }

  // Cargar categorías raíz
  await cargarCategorias();

  // Listener del formulario (evitar duplicados)
  if (form && !form.dataset.listener) {
    form.dataset.listener = "true";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim();
      const descripcion = document.getElementById("descripcion").value.trim();

      if (!nombre) {
        alert("❌ El nombre es requerido");
        return;
      }

      try {
        await apiClient.createCategoria({ nombre, descripcion });
        form.reset();
        await cargarCategorias();
        appEvents.emit("categoria:creada", { nombre, descripcion });
        alert("✅ Categoría creada correctamente");
      } catch (err) {
        console.error("❌ Error creando categoría:", err);
        alert("Error al crear categoría: " + err.message);
      }
    });
  }

  console.log("✅ Categorías inicializadas correctamente");
}

// ======================================================
// 🎯 CARGAR TODAS LAS CATEGORÍAS
// ======================================================
async function cargarCategorias() {
  try {
    console.log("🔄 Cargando categorías desde backend MySQL...");
    const token = localStorage.getItem("authToken");
    const res = await fetch("http://localhost:3001/api/categorias", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Error al obtener categorías desde backend");
    const categorias = await res.json();

    console.log("✅ Categorías recibidas:", categorias);
    const lista = document.getElementById("listaCategorias");
    lista.innerHTML = "";

    if (!categorias?.length) {
      lista.innerHTML = '<li class="no-items">No hay categorías registradas</li>';
      return;
    }

    const categoriasRaiz = categorias.filter((cat) => cat.parent_id === null);
    console.log(`📊 Mostrando ${categoriasRaiz.length} categorías raíz`);

    if (!categoriasRaiz.length) {
      lista.innerHTML = '<li class="no-items">No hay categorías raíz registradas</li>';
      return;
    }

    categoriasRaiz.forEach((cat) => {
      const li = document.createElement("li");
      li.className = "categoria-card";
      li.innerHTML = `
        <div class="card" onclick="abrirDetalleCategoria(${cat.id_categoria}, '${_safe(cat.nombre)}')">
          <div class="card-header">
            <h3>${cat.nombre}</h3>
            <span class="badge">${cat.parent_id ? "Subcategoría" : "Categoría"}</span>
          </div>
          <p class="card-desc">${cat.descripcion?.trim() || "Sin descripción"}</p>
          <div class="card-actions">
            <button class="btn-small" onclick="event.stopPropagation(); crearSubcategoria(${cat.id_categoria}, '${_safe(cat.nombre)}')">➕ Sub</button>
            <button class="btn-small btn-edit" onclick="event.stopPropagation(); editarCategoria(${cat.id_categoria}, '${_safe(cat.nombre)}', '${_safe(cat.descripcion || "")}')">✏️</button>
            <button class="btn-small btn-delete" onclick="event.stopPropagation(); eliminarCategoria(${cat.id_categoria})">🗑️</button>
          </div>
        </div>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Error cargando categorías:", err);
    alert("Error al cargar categorías: " + err.message);
  }
}

// ======================================================
// 🔒 Helper seguro
// ======================================================
const _safe = (s = "") => String(s).replace(/'/g, "\\'");

// ======================================================
// 🎯 FUNCIONES GLOBALES CRUD
// ======================================================
window.cargarCategorias = cargarCategorias;

window.abrirDetalleCategoria = async (id, nombre) => {
  console.log(`🔍 Abriendo detalle: ${nombre}`);
  document.getElementById("vistaRaiz").style.display = "none";
  document.getElementById("vistaDetalle").style.display = "block";
  await cargarVistaDetalle(id, nombre);
};

async function cargarVistaDetalle(categoriaId, nombreCategoria) {
  try {
    document.getElementById("detalleTitulo").textContent = `Categoría: ${nombreCategoria}`;
    document.getElementById("detalleNombre").textContent = nombreCategoria;
    window.categoriaActualId = categoriaId;

    const categoria = await apiClient.getCategoriaById(categoriaId);
    document.getElementById("detalleDescripcion").textContent =
      categoria.descripcion || "Sin descripción";

    const subcategorias = await apiClient.get(`/categorias/${categoriaId}/subcategorias`);
    document.getElementById("detalleSubcount").textContent = subcategorias.length;
    renderSubcategorias(subcategorias);

    let productos = [];
    try {
      productos = await apiClient.get(`/productos/categoria/${categoriaId}`);
    } catch {
      console.warn("⚠️ No se encontró endpoint de productos, se omite.");
    }

    document.getElementById("detalleProductos").textContent = productos.length;
    renderProductos(productos);
  } catch (err) {
    console.error("❌ Error en detalle:", err);
    alert("Error al cargar detalle de la categoría");
  }
}

function renderSubcategorias(subcategorias) {
  const container = document.getElementById("listaSubcategorias");
  container.innerHTML = subcategorias.length
    ? subcategorias
        .map(
          (s) => `
        <div class="categoria-card small" onclick="abrirDetalleCategoria(${s.id_categoria}, '${_safe(s.nombre)}')">
          <h4>${s.nombre}</h4>
          <p>${s.descripcion || "Sin descripción"}</p>
        </div>`
        )
        .join("")
    : '<p class="no-items">No hay subcategorías</p>';
}

function renderProductos(productos) {
  const container = document.getElementById("listaProductos");
  container.innerHTML = productos.length
    ? productos
        .map((p) => {
          const precio = parseFloat(p.precio_unitario || 0).toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `
            <div class="producto-card">
              <div class="card">
                <img src="${p.imagen || "../assets/images/default-product.png"}" alt="${p.nombre}">
                <h4>${p.nombre}</h4>
                <p class="precio">$${precio}</p>
                <p class="stock">Stock: ${p.stock || 0}</p>
              </div>
            </div>`;
        })
        .join("")
    : '<p class="no-items">No hay productos en esta categoría</p>';
}

window.volverALista = () => {
  document.getElementById("vistaDetalle").style.display = "none";
  document.getElementById("vistaRaiz").style.display = "block";
};

window.crearSubcategoriaEnDetalle = async () => {
  const categoriaActual = document.getElementById("detalleNombre").textContent;
  const categoriaId = window.categoriaActualId;
  await crearSubcategoria(categoriaId, categoriaActual);
  await cargarVistaDetalle(categoriaId, categoriaActual);
};

window.crearSubcategoria = async (parentId, nombrePadre) => {
  const nombre = prompt(`Nombre de la subcategoría dentro de "${nombrePadre}":`);
  if (!nombre) return;
  const descripcion = prompt("Descripción (opcional):") || "";

  try {
    await apiClient.createCategoria({ nombre, descripcion, parent_id: parentId });
    await cargarCategorias();
    alert(`✅ Subcategoría "${nombre}" creada correctamente bajo "${nombrePadre}"`);
  } catch (err) {
    console.error("❌ Error creando subcategoría:", err);
    alert("Error al crear subcategoría: " + err.message);
  }
};

window.editarCategoria = async (id, nombreActual, descripcionActual) => {
  const nuevoNombre = prompt("Nuevo nombre:", nombreActual);
  if (nuevoNombre === null) return;
  const nuevaDescripcion = prompt("Nueva descripción:", descripcionActual);

  try {
    await apiClient.updateCategoria(id, { nombre: nuevoNombre, descripcion: nuevaDescripcion });
    await cargarCategorias();
    appEvents.emit("categoria:actualizada", { id, nombre: nuevoNombre });
    alert("✅ Categoría actualizada correctamente");
  } catch (err) {
    console.error("❌ Error editando categoría:", err);
    alert("Error al editar categoría: " + err.message);
  }
};

window.eliminarCategoria = async (id) => {
  if (!confirm("¿Seguro de eliminar esta categoría?")) return;
  try {
    await apiClient.deleteCategoria(id);
    await cargarCategorias();
    appEvents.emit("categoria:eliminada", { id });
    alert("✅ Categoría eliminada correctamente");
  } catch (err) {
    console.error("❌ Error eliminando categoría:", err);
    if (err.message.includes("400")) {
      alert("❌ No se puede eliminar la categoría: tiene productos asociados.");
    } else {
      alert("Error al eliminar categoría: " + err.message);
    }
  }
};

// ======================================================
// 🎯 MODALES DE PRODUCTOS (sin duplicar eventos)
// ======================================================
window.mostrarModalProducto = function (categoriaId, categoriaNombre) {
  const modal = document.getElementById("modalProducto");
  document.getElementById("modalCategoriaId").value = categoriaId;
  document.getElementById("modalCategoriaNombre").textContent = categoriaNombre;
  modal.style.display = "flex";

  cargarMarcasYProveedores();
  document.getElementById("productoNombre").focus();
};

window.cerrarModalProducto = function () {
  document.getElementById("modalProducto").style.display = "none";
  document.getElementById("formProducto").reset();
};

async function cargarMarcasYProveedores() {
  try {
    const marcas = await apiClient.get("/marcas");
    const marcaSelect = document.getElementById("productoMarca");
    marcaSelect.innerHTML = '<option value="">Sin marca</option>';
    marcas.forEach((marca) => {
      if (marca.estado) {
        const opt = document.createElement("option");
        opt.value = marca.id_marca;
        opt.textContent = marca.nombre;
        marcaSelect.appendChild(opt);
      }
    });

    const proveedores = await apiClient.get("/proveedores");
    const proveedorSelect = document.getElementById("productoProveedor");
    proveedorSelect.innerHTML = '<option value="">Sin proveedor</option>';
    proveedores.forEach((prov) => {
      const opt = document.createElement("option");
      opt.value = prov.id_proveedor;
      opt.textContent = prov.nombre;
      proveedorSelect.appendChild(opt);
    });
  } catch (error) {
    console.warn("⚠️ No se pudieron cargar marcas/proveedores:", error);
  }
}

// Evitar duplicar listener del formulario
const formProducto = document.getElementById("formProducto");
if (formProducto && !formProducto.dataset.listener) {
  formProducto.dataset.listener = "true";
  formProducto.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoriaId = document.getElementById("modalCategoriaId").value;
    const productoData = {
      nombre: document.getElementById("productoNombre").value.trim(),
      descripcion: document.getElementById("productoDescripcion").value.trim(),
      precio_unitario: parseFloat(document.getElementById("productoPrecio").value),
      stock: parseInt(document.getElementById("productoStock").value),
      unidad_medida: document.getElementById("productoUnidad").value,
      id_marca: document.getElementById("productoMarca").value || null,
      id_proveedor: document.getElementById("productoProveedor").value || null,
      estado: parseInt(document.getElementById("productoEstado").value),
    };

    if (!productoData.nombre || !productoData.precio_unitario || !productoData.stock || !productoData.unidad_medida) {
      alert("❌ Por favor completa los campos obligatorios");
      return;
    }

    try {
      console.log("🔄 Creando producto en categoría:", categoriaId, productoData);
      const response = await apiClient.post(`/categorias/${categoriaId}/productos`, productoData);
      console.log("✅ Producto creado:", response);
      cerrarModalProducto();
      const categoriaNombre = document.getElementById("detalleNombre").textContent;
      await cargarVistaDetalle(categoriaId, categoriaNombre);
      alert(`✅ Producto "${productoData.nombre}" agregado correctamente`);
    } catch (error) {
      console.error("❌ Error creando producto:", error);
      alert("❌ Error al crear producto: " + error.message);
    }
  });
}

document.getElementById("modalProducto")?.addEventListener("click", (e) => {
  if (e.target.id === "modalProducto") cerrarModalProducto();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.getElementById("modalProducto")?.style.display === "flex") {
    cerrarModalProducto();
  }
});
