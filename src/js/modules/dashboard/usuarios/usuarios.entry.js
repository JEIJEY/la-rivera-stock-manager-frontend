import logger from "../../../core/logger.js";
import { empleadosService } from "./usuarios.service.js";
import { empleadosView } from "./usuarios.view.js";

export async function inicializarUsuarios() {
  logger.info("Inicializando vista de empleados (admin)...");

  const tabla = document.getElementById("tablaEmpleados");
  const estado = document.getElementById("estadoCargaEmpleados");
  const btnRecargar = document.getElementById("btnRecargarEmpleados");
  const btnAplicar = document.getElementById("btnAplicarFiltrosEmpleados");
  const btnLimpiar = document.getElementById("btnLimpiarFiltrosEmpleados");
  const filtroRol = document.getElementById("filtroRolEmpleado");
  const filtroEstado = document.getElementById("filtroEstadoEmpleado");
  const filtroPendientes = document.getElementById("filtroSoloPendientes");
  const modal = document.getElementById("modalEmpleado");
  const formModal = document.getElementById("formEmpleado");
  const btnCancelar = document.getElementById("btnCancelarEmpleado");

  if (!tabla || !estado) {
    logger.warn("DOM de empleados no encontrado");
    return;
  }

  // Cargar roles para selects
  let roles = [];
  try {
    roles = await empleadosService.getRoles();
  } catch (err) {
    logger.error({ err }, "Error cargando roles");
    empleadosView.setEstado(estado, "💥 No se pudieron cargar los roles. ¿Tienes permiso de admin/propietario?");
    return;
  }
  if (filtroRol) empleadosView.renderRolFiltro(filtroRol, roles);

  // Handler de eliminación — disponible para renderTabla vía view
  empleadosView.onEliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}?\n\nEsta acción es permanente. Si tiene movimientos registrados no se podrá eliminar.`)) return;
    try {
      await empleadosService.eliminar(id);
      alert(`✅ ${nombre} eliminado correctamente`);
      await cargarEmpleados();
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  await cargarEmpleados();

  attach(btnRecargar, "click", cargarEmpleados);
  attach(btnAplicar, "click", cargarEmpleados);
  attach(btnLimpiar, "click", () => {
    if (filtroRol) filtroRol.value = "";
    if (filtroEstado) filtroEstado.value = "";
    if (filtroPendientes) filtroPendientes.checked = false;
    cargarEmpleados();
  });

  attach(btnCancelar, "click", () => empleadosView.cerrarModal(modal));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) empleadosView.cerrarModal(modal);
  });

  if (formModal && !formModal.dataset.listener) {
    formModal.dataset.listener = "true";
    formModal.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("empId").value;
      const id_rol = document.getElementById("empRol").value;
      const estadoVal = document.getElementById("empEstado").value;
      try {
        await empleadosService.actualizar(id, { id_rol, estado: estadoVal });
        alert("✅ Empleado actualizado");
        empleadosView.cerrarModal(modal);
        await cargarEmpleados();
      } catch (err) {
        alert(`❌ ${err.message}`);
      }
    });
  }

  async function cargarEmpleados() {
    empleadosView.setEstado(estado, "⏳ Cargando empleados...");
    try {
      const filtros = {
        id_rol: filtroRol?.value,
        estado: filtroEstado?.value,
        solo_pendientes: filtroPendientes?.checked ? "true" : "",
      };
      const empleados = await empleadosService.getAll(filtros);
      empleadosView.renderTabla(empleados, tabla, estado, (emp) => {
        empleadosView.abrirModal(modal, emp, roles);
      });
    } catch (err) {
      logger.error({ err }, "Error cargando empleados");
      empleadosView.setEstado(estado, `💥 ${err.message}`);
    }
  }
}

function attach(el, event, handler) {
  if (!el || el.dataset.listener) return;
  el.dataset.listener = "true";
  el.addEventListener(event, handler);
}
