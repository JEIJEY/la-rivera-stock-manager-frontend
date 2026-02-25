// ✅ VISTA DE PRODUCTOS - VERSIÓN CORREGIDA
// Este módulo no controla la navegación, solo muestra productos cuando se le indica.

import apiClient from "../utilities/apiClient.js";

// Exportamos una función pura que el módulo de navegación invoca
export async function mostrarProductos(categoriaId, nombreCategoria) {
  const contenedor = document.getElementById("vistaCategorias");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <p class="loading">Cargando productos de <strong>${nombreCategoria}</strong>...</p>
  `;

  try {
    const productos = await apiClient.getProductosPorCategoria(categoriaId);

    if (!productos || productos.length === 0) {
      contenedor.innerHTML = `<p class="no-items">No hay productos en esta categoría.</p>`;
      return;
    }

    contenedor.innerHTML = productos
      .map(
        (p) => `
        <div class="producto-card">
          <img src="${p.imagen || "../assets/images/default.png"}" alt="${p.nombre}" />
          <div class="producto-info">
            <h3>${p.nombre}</h3>
            <p>${p.descripcion || "Sin descripción"}</p>
            <span class="producto-precio">$${p.precio || "0.00"}</span>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("❌ Error mostrando productos:", err);
    contenedor.innerHTML = `<p class="error">Error al cargar productos.</p>`;
  }
}
