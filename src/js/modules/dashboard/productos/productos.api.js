import apiClient from "../../../core/apiClient.js";

export const productosApi = {
  getAll: () => apiClient.getProductos(),
  getById: (id) => apiClient.getProductoById(id),
  getByCategoria: (id) => apiClient.getProductosPorCategoria(id),
  create: (data) => apiClient.createProducto(data),
  update: (id, data) => apiClient.updateProducto(id, data),
  delete: (id) => apiClient.deleteProducto(id),
  getCategorias: () => apiClient.getCategorias(),
  getMarcas: () => apiClient.get("/marcas"),
  getProveedores: () => apiClient.get("/proveedores"),
  createCategoria: (data) => apiClient.createCategoria(data),
  createMarca: (data) => apiClient.post("/marcas", data),
  createProveedor: (data) => apiClient.post("/proveedores", data),
};