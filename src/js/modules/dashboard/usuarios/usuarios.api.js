import apiClient from "../../../core/apiClient.js";

function buildQuery(filtros = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const empleadosApi = {
  getAll: (filtros = {}) => apiClient.get(`/empleados${buildQuery(filtros)}`),
  getById: (id) => apiClient.get(`/empleados/${id}`),
  actualizar: (id, data) => apiClient.put(`/empleados/${id}`, data),
  cambiarRol: (id, id_rol) => apiClient.put(`/empleados/${id}/rol`, { id_rol }),
  cambiarEstado: (id, estado) => apiClient.put(`/empleados/${id}/estado`, { estado }),
  getRoles: () => apiClient.get("/roles"),
  eliminar: (id) => apiClient.delete(`/empleados/${id}`),
};
