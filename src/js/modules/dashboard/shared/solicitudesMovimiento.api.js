import apiClient from "../../../core/apiClient.js";

/**
 * Wrapper sobre apiClient para el módulo solicitudes-movimiento.
 * Usado por la vista Aprobaciones (admin) y por el flujo del vendedor en movimientos.
 */
export const solicitudesMovimientoApi = {
  crear: (datos) => apiClient.post("/solicitudes-movimiento", datos),

  getPendientes: () => apiClient.get("/solicitudes-movimiento/pendientes"),

  getMias: () => apiClient.get("/solicitudes-movimiento/mias"),

  aprobar: (id) =>
    apiClient.post(`/solicitudes-movimiento/${id}/aprobar`, {}),

  rechazar: (id, motivo_rechazo) =>
    apiClient.post(`/solicitudes-movimiento/${id}/rechazar`, { motivo_rechazo }),

  cancelar: (id) =>
    apiClient.post(`/solicitudes-movimiento/${id}/cancelar`, {}),
};
