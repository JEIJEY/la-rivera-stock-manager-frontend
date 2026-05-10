import apiClient from "../../../core/apiClient.js";

/**
 * Wrapper sobre apiClient para el módulo notificaciones.
 * Usa PUT (no PATCH) porque apiClient solo expone get/post/put/delete.
 */
export const notificacionesApi = {
  listar: (soloNoLeidas = false) =>
    apiClient.get(`/notificaciones${soloNoLeidas ? "?no_leidas=1" : ""}`),

  conteo: () => apiClient.get("/notificaciones/conteo"),

  marcarLeida: (id) => apiClient.put(`/notificaciones/${id}/leer`, {}),

  marcarTodasLeidas: () => apiClient.put("/notificaciones/leer-todas", {}),

  eliminar: (id) => apiClient.delete(`/notificaciones/${id}`),
};
