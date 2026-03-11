const _safe = (s = "") => String(s).replace(/'/g, "\\'");

export const categoriasView = {
  renderLista(categorias, container) {
    container.innerHTML = "";

    if (!categorias?.length) {
      container.innerHTML = '<li class="no-items cat-vacio">No hay categorías registradas</li>';
      return;
    }

    categorias.forEach((cat) => {
      const li = document.createElement("li");
      li.className = "categoria-card cat-tarjeta";
      li.dataset.id = cat.id_categoria;
      li.innerHTML = `
        <div class="card cat-tarjeta__card" data-action="detalle" data-id="${cat.id_categoria}" data-nombre="${_safe(cat.nombre)}">
          <div class="card-header cat-tarjeta__header">
            <h3>${cat.nombre}</h3>
            <span class="badge cat-distintivo">${cat.parent_id ? "Subcategoría" : "Categoría"}</span>
          </div>
          <p class="card-desc cat-tarjeta__desc">${cat.descripcion?.trim() || "Sin descripción"}</p>
          <div class="card-actions cat-tarjeta__acciones">
            <button class="btn-small cat-btn" data-action="subcategoria" data-id="${cat.id_categoria}" data-nombre="${_safe(cat.nombre)}">➕ Sub</button>
            <button class="btn-small btn-edit cat-btn cat-btn--editar" data-action="editar" data-id="${cat.id_categoria}" data-nombre="${_safe(cat.nombre)}" data-desc="${_safe(cat.descripcion || "")}">✏️</button>
            <button class="btn-small btn-delete cat-btn cat-btn--eliminar" data-action="eliminar" data-id="${cat.id_categoria}">🗑️</button>
          </div>
        </div>
      `;
      container.appendChild(li);
    });
  },

  renderDetalle({ categoria, subcategorias, productos }) {
    document.getElementById("detalleTitulo").textContent = `Categoría: ${categoria.nombre}`;
    document.getElementById("detalleNombre").textContent = categoria.nombre;
    document.getElementById("detalleDescripcion").textContent = categoria.descripcion || "Sin descripción";
    document.getElementById("detalleSubcount").textContent = subcategorias.length;
    document.getElementById("detalleProductos").textContent = productos.length;

    this.renderSubcategorias(subcategorias);
    this.renderProductos(productos);
  },

  renderSubcategorias(subcategorias) {
    const container = document.getElementById("listaSubcategorias");
    if (!container) return;
    container.innerHTML = subcategorias.length
      ? subcategorias.map((s) => `
          <div class="categoria-card cat-tarjeta small" data-action="detalle" data-id="${s.id_categoria}" data-nombre="${_safe(s.nombre)}">
            <h4>${s.nombre}</h4>
            <p>${s.descripcion || "Sin descripción"}</p>
          </div>`).join("")
      : '<p class="no-items cat-vacio">No hay subcategorías</p>';
  },

  renderProductos(productos) {
    const container = document.getElementById("listaProductos");
    if (!container) return;
    container.innerHTML = productos.length
      ? productos.map((p) => {
          const precio = parseFloat(p.precio_unitario || 0).toLocaleString("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          return `
            <div class="producto-card cat-producto">
              <div class="card cat-tarjeta__card">
                <img src="${p.imagen || "/src/assets/images/default-product.png"}" alt="${p.nombre}">
                <h4>${p.nombre}</h4>
                <p class="precio cat-producto__precio">$${precio}</p>
                <p class="stock cat-producto__stock">Stock: ${p.stock || 0}</p>
              </div>
            </div>`;
        }).join("")
      : '<p class="no-items cat-vacio">No hay productos en esta categoría</p>';
  },

  mostrarVista(vista) {
    document.getElementById("vistaRaiz").style.display = vista === "raiz" ? "block" : "none";
    document.getElementById("vistaDetalle").style.display = vista === "detalle" ? "block" : "none";
  },

  renderMarcas(marcas) {
    const select = document.getElementById("productoMarca");
    if (!select) return;
    select.innerHTML = '<option value="">Sin marca</option>';
    marcas.filter(m => m.estado).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id_marca;
      opt.textContent = m.nombre;
      select.appendChild(opt);
    });
  },

  renderProveedores(proveedores) {
    const select = document.getElementById("productoProveedor");
    if (!select) return;
    select.innerHTML = '<option value="">Sin proveedor</option>';
    proveedores.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id_proveedor;
      opt.textContent = p.nombre;
      select.appendChild(opt);
    });
  },
};