/**
 * barcodeApi.js — Lookup de productos por código de barras
 */
import apiClient from "../../../core/apiClient.js";

export const barcodeApi = {
  getByBarcode: (codigo) =>
    apiClient.get(`/productos/barcode/${encodeURIComponent(codigo)}`),
};
