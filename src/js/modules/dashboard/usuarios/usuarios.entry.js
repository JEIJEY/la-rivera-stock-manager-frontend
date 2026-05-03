import logger from "../../../core/logger.js";
import { inicializarEnConstruccion } from "../shared/inicializarEnConstruccion.js";

export async function inicializarUsuarios() {
  logger.info("Vista de usuarios cargada");
  inicializarEnConstruccion();
}
