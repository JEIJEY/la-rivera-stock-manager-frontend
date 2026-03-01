import { inventarioApi } from "./inventario.api.js";

export const inventarioService = {
  async getProductos() {
    return inventarioApi.getProductos();
  },

  async crearProducto(data) {
    const { nombre, precio_unitario, id_categoria } = data;
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    if (!precio_unitario) throw new Error("El precio es requerido");
    if (!id_categoria) throw new Error("La categoría es requerida");
    return inventarioApi.createProducto(data);
  },

  async getSelectsData() {
    const [categorias, marcas, proveedores] = await Promise.all([
      inventarioApi.getCategorias(),
      inventarioApi.getMarcas(),
      inventarioApi.getProveedores(),
    ]);
    return { categorias, marcas, proveedores };
  },

  async crearDesdeSelect(tipo, nombre) {
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    const mapa = {
      categorias: { fn: inventarioApi.createCategoria, idCampo: "id_categoria" },
      marcas: { fn: inventarioApi.createMarca, idCampo: "id_marca" },
      proveedores: { fn: inventarioApi.createProveedor, idCampo: "id_proveedor" },
    };
    const { fn, idCampo } = mapa[tipo];
    const data = await fn({ nombre });
    return { data, idCampo };
  },
};