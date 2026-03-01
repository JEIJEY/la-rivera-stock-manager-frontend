import { productosApi } from "./productos.api.js";

export const productosService = {
  async getAll() {
    return productosApi.getAll();
  },

  async crear(data) {
    const { nombre, precio_unitario, id_categoria } = data;
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    if (!precio_unitario) throw new Error("El precio es requerido");
    if (!id_categoria) throw new Error("La categoría es requerida");
    return productosApi.create(data);
  },

  async getSelectsData() {
    const [categorias, marcas, proveedores] = await Promise.all([
      productosApi.getCategorias(),
      productosApi.getMarcas(),
      productosApi.getProveedores(),
    ]);
    return { categorias, marcas, proveedores };
  },

  async crearDesdeSelect(tipo, nombre) {
    if (!nombre?.trim()) throw new Error("El nombre es requerido");
    const mapa = {
      categorias: { fn: productosApi.createCategoria, idCampo: "id_categoria" },
      marcas: { fn: productosApi.createMarca, idCampo: "id_marca" },
      proveedores: { fn: productosApi.createProveedor, idCampo: "id_proveedor" },
    };
    const { fn, idCampo } = mapa[tipo];
    const data = await fn({ nombre });
    return { data, idCampo };
  },
};