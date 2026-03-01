import { categoriasApi } from "./categorias.api.js";

export const categoriasService = {
  async getCategorias() {
    const categorias = await categoriasApi.getAll();
    return categorias.filter((cat) => cat.parent_id === null);
  },

  async getDetalle(id) {
    const [categoria, subcategorias, productos] = await Promise.all([
      categoriasApi.getById(id),
      categoriasApi.getSubcategorias(id),
      categoriasApi.getProductos(id).catch(() => []),
    ]);
    return { categoria, subcategorias, productos };
  },

  async crear(nombre, descripcion, parentId = null) {
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    return categoriasApi.create({ nombre, descripcion, parent_id: parentId });
  },

  async actualizar(id, nombre, descripcion) {
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    return categoriasApi.update(id, { nombre, descripcion });
  },

  async eliminar(id) {
    return categoriasApi.delete(id);
  },

  async getMarcasYProveedores() {
    const [marcas, proveedores] = await Promise.all([
      categoriasApi.getMarcas(),
      categoriasApi.getProveedores(),
    ]);
    return { marcas, proveedores };
  },
};