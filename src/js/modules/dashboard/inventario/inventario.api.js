import apiClient from "../../../core/apiClient.js";

export const inventarioApi = {
  getProductos: () => apiClient.getProductos(),
  createProducto: (data) => apiClient.createProducto(data),
  getCategorias: () => apiClient.getCategorias(),
  getMarcas: () => apiClient.get("/marcas"),
  getProveedores: () => apiClient.get("/proveedores"),
  createCategoria: (data) => apiClient.createCategoria(data),
  createMarca: (data) => apiClient.post("/marcas", data),
  createProveedor: (data) => apiClient.post("/proveedores", data),
};