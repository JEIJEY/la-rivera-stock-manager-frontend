import apiClient from "../../../core/apiClient.js";

export const categoriasApi = {
  getAll: () => apiClient.getCategorias(),
  getById: (id) => apiClient.getCategoriaById(id),
  getSubcategorias: (id) => apiClient.getSubcategorias(id),
  getJerarquia: () => apiClient.getJerarquiaCategorias(),
  create: (data) => apiClient.createCategoria(data),
  update: (id, data) => apiClient.updateCategoria(id, data),
  delete: (id) => apiClient.deleteCategoria(id),
  getProductos: (id) => apiClient.getProductosPorCategoria(id),
  getMarcas: () => apiClient.get("/marcas"),
  getProveedores: () => apiClient.get("/proveedores"),
};