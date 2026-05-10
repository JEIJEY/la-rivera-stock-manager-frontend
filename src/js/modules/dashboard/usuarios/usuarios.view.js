const ESTADO_LABEL = {
  1: "🟢 Activo",
  0: "🔴 Inactivo",
};

const ROL_BADGE = {
  admin: "🛡️",
  propietario: "👑",
  bodeguero: "📦",
  vendedor: "🛒",
  pendiente: "⏳",
};

export const empleadosView = {
  renderTabla(empleados, tabla, estado, onEditar) {
    tabla.innerHTML = "";
    if (!empleados?.length) {
      estado.textContent = "📭 No hay empleados registrados con esos filtros.";
      return;
    }

    empleados.forEach((e) => {
      const fila = document.createElement("tr");
      const esPendiente = e.rol_nombre === "pendiente";
      if (esPendiente) fila.classList.add("empleados__fila--pendiente");

      fila.innerHTML = `
        <td>${e.id_empleado}</td>
        <td>${escapeHtml(e.nombre)} ${escapeHtml(e.apellidos || "")}</td>
        <td>${escapeHtml(e.email)}</td>
        <td>${escapeHtml(e.cedula || "-")}</td>
        <td>${ROL_BADGE[e.rol_nombre] || ""} ${escapeHtml(e.rol_nombre || "-")}</td>
        <td>${ESTADO_LABEL[e.estado] || "-"}</td>
        <td>${e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : "-"}</td>
        <td style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-editar" data-id="${e.id_empleado}">✏️ Editar</button>
          <button class="btn btn-danger btn-eliminar" data-id="${e.id_empleado}" data-nombre="${escapeHtml(e.nombre)} ${escapeHtml(e.apellidos||'')}">🗑️ Eliminar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });

    tabla.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const empleado = empleados.find((x) => x.id_empleado === id);
        if (empleado) onEditar(empleado);
      });
    });

    tabla.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const nombre = btn.dataset.nombre;
        if (this.onEliminar) this.onEliminar(id, nombre);
      });
    });

    estado.textContent = `✅ ${empleados.length} empleado(s)`;
  },

  renderRolSelect(select, roles, selectedId = null) {
    select.innerHTML = "";
    roles.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id_rol;
      opt.textContent = r.nombre;
      if (selectedId && Number(selectedId) === r.id_rol) opt.selected = true;
      select.appendChild(opt);
    });
  },

  renderRolFiltro(select, roles) {
    const actual = select.value;
    select.innerHTML = `<option value="">Todos</option>`;
    roles.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id_rol;
      opt.textContent = r.nombre;
      select.appendChild(opt);
    });
    if (actual) select.value = actual;
  },

  abrirModal(modal, empleado, roles) {
    document.getElementById("empId").value = empleado.id_empleado;
    document.getElementById("empNombreLabel").textContent =
      `${empleado.nombre} ${empleado.apellidos || ""}`;
    document.getElementById("empEmailLabel").textContent = empleado.email;
    document.getElementById("empEstado").value = String(empleado.estado);
    this.renderRolSelect(document.getElementById("empRol"), roles, empleado.id_rol);
    modal.style.display = "flex";
  },

  cerrarModal(modal) {
    modal.style.display = "none";
  },

  setEstado(estado, msg) {
    if (estado) estado.textContent = msg;
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
