export const productosView = {
  renderTabla(productos, tabla, estado) {
    tabla.innerHTML = "";

    if (!productos?.length) {
      estado.textContent = "📭 No hay productos registrados.";
      return;
    }

    productos.forEach((p) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.id_producto}</td>
        <td>${p.nombre}</td>
        <td>${p.descripcion || "-"}</td>
        <td>${p.stock || 0}</td>
        <td>${p.unidad_medida || "-"}</td>
        <td>$${p.precio_unitario?.toLocaleString() || "-"}</td>
        <td>${p.categoria_nombre || "-"}</td>
        <td>${p.marca_nombre || "-"}</td>
        <td>${p.proveedor_nombre || "-"}</td>
        <td>${p.estado ? "🟢 Activo" : "🔴 Inactivo"}</td>
        <td>${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString() : "-"}</td>
        <td>${p.fecha_actualizacion ? new Date(p.fecha_actualizacion).toLocaleDateString() : "-"}</td>
      `;
      tabla.appendChild(fila);
    });

    estado.textContent = "✅ Productos cargados correctamente";
  },

  renderSelect(select, items, idCampo, nombreCampo, placeholder) {
    select.innerHTML = `
      <option value="">${placeholder}</option>
      <option value="crear-nueva">➕ Crear nuevo...</option>
    `;
    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item[idCampo];
      opt.textContent = item[nombreCampo];
      select.appendChild(opt);
    });
  },

  mostrarModal(modal) {
    modal.style.display = "flex";
  },

  ocultarModal(modal) {
    modal.style.display = "none";
    const form = modal.querySelector("form");
    if (form) form.reset();
  },

  setEstado(estado, msg) {
    if (estado) estado.textContent = msg;
  },
};