import { abcApi } from "./abc.api.js";

export const abcService = {
  async getReporte() {
    const result = await abcApi.getReporte();
    if (!result.success) throw new Error(result.message || "Error obteniendo reporte ABC");
    return result;
  },

  async recalcular() {
    const result = await abcApi.recalcular();
    if (!result.success) throw new Error(result.message || "Error recalculando ABC");
    return result;
  },

  calcularPorcentajes(stats) {
    const { A, B, C, total } = stats;
    return {
      A: total ? Math.round((A / total) * 100) : 0,
      B: total ? Math.round((B / total) * 100) : 0,
      C: total ? Math.round((C / total) * 100) : 0,
    };
  },
};