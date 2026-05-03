import logger from "../../../core/logger.js";
import { inicializarEnConstruccion } from "../shared/inicializarEnConstruccion.js";

export async function inicializarReportes() {
  logger.info("Vista de reportes cargada");
  inicializarEnConstruccion();
}
