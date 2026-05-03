import logger from "../../../core/logger.js";
import { inicializarEnConstruccion } from "../shared/inicializarEnConstruccion.js";

export async function inicializarMovimientos() {
  logger.info("Vista de movimientos cargada");
  inicializarEnConstruccion();
}
