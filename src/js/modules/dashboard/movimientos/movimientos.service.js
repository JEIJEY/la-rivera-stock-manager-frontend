import { movimientosApi } from "./movimientos.api.js";

const TIPOS_VALIDOS = ["entrada", "salida", "baja"];
const MOTIVOS_VALIDOS = ["caducidad", "daño", "robo", "otro"];

function validarBase(data) {
  if (!data.id_producto) throw new Error("Debe seleccionar un producto");
  const cant = Number(data.cantidad);
  if (!Number.isFinite(cant) || cant <= 0) {
    throw new Error("La cantidad debe ser mayor a 0");
  }
}

function validarBaja(data) {
  validarBase(data);
  if (!MOTIVOS_VALIDOS.includes(data.motivo)) {
    throw new Error("Motivo inválido para baja");
  }
  const obs = (data.observacion ?? "").trim();
  if (obs.length < 5) {
    throw new Error("La observación es obligatoria (mín 5 caracteres) para bajas");
  }
}

export const movimientosService = {
  async getAll(filtros = {}) {
    return movimientosApi.getAll(filtros);
  },

  async getProductos() {
    return movimientosApi.getProductos();
  },

  async getEmpleados() {
    try {
      return await movimientosApi.getEmpleados();
    } catch (err) {
      // Empleados solo accesible para admin/propietario; fallar silencioso.
      return [];
    }
  },

  async registrar(tipo, data) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`Tipo inválido: ${tipo}`);
    }

    if (tipo === "baja") validarBaja(data);
    else validarBase(data);

    const payload = {
      id_producto: Number(data.id_producto),
      cantidad: Number(data.cantidad),
    };
    if (data.observacion?.trim()) payload.observacion = data.observacion.trim();
    if (tipo === "baja") payload.motivo = data.motivo;

    if (tipo === "entrada") return movimientosApi.registrarEntrada(payload);
    if (tipo === "salida") return movimientosApi.registrarSalida(payload);
    return movimientosApi.registrarBaja(payload);
  },
};
