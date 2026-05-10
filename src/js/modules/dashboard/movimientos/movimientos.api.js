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

export const movimientosApi = {
  getAll: (filtros = {}) => apiClient.get(`/movimientos${buildQuery(filtros)}`),
  getById: (id) => apiClient.get(`/movimientos/${id}`),
  getByProducto: (id_producto) => apiClient.get(`/movimientos/producto/${id_producto}`),
  registrarEntrada: (data) => apiClient.post("/movimientos/entrada", data),
  registrarSalida: (data) => apiClient.post("/movimientos/salida", data),
  registrarBaja: (data) => apiClient.post("/movimientos/baja", data),
  getProductos: () => apiClient.getProductos(),
  getEmpleados: () => apiClient.get("/empleados"),
};
