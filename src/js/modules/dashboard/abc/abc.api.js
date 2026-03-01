import apiClient from "../../../core/apiClient.js";

export const abcApi = {
  getReporte: () => apiClient.get("/abc/reporte"),
  recalcular: () => apiClient.post("/abc/recalcular"),
};