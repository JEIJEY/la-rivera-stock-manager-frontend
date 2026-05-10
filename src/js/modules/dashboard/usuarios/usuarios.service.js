import { empleadosApi } from "./usuarios.api.js";

export const empleadosService = {
  async getAll(filtros = {}) {
    return empleadosApi.getAll(filtros);
  },

  async getRoles() {
    return empleadosApi.getRoles();
  },

  async eliminar(id) {
    if (!id) throw new Error("ID empleado requerido");
    return empleadosApi.eliminar(id);
  },

  async actualizar(id, { id_rol, estado }) {
    if (!id) throw new Error("ID empleado requerido");
    const id_rol_num = Number(id_rol);
    const estado_num = Number(estado);
    if (!Number.isInteger(id_rol_num) || id_rol_num <= 0) {
      throw new Error("Rol inválido");
    }
    if (![0, 1].includes(estado_num)) {
      throw new Error("Estado inválido");
    }
    // Llamadas separadas (los endpoints son independientes)
    const resultados = [];
    try {
      const r = await empleadosApi.cambiarRol(id, id_rol_num);
      resultados.push(r);
    } catch (e) {
      // Si "ya tiene ese rol", continuar igual
      if (!/ya tiene/i.test(e.message)) throw e;
    }
    try {
      const r = await empleadosApi.cambiarEstado(id, estado_num);
      resultados.push(r);
    } catch (e) {
      if (!/no se realizaron cambios/i.test(e.message)) throw e;
    }
    return resultados;
  },
};
