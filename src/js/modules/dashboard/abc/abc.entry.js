import logger from "../../../core/logger.js";
import { abcService } from "./abc.service.js";
import { abcView } from "./abc.view.js";

export async function inicializarABC() {
  logger.info("Inicializando módulo ABC...");

  await cargarDatos();
  conectarBoton();

  logger.info("Módulo ABC inicializado correctamente");
}

async function cargarDatos() {
  try {
    const result = await abcService.getReporte();
    const porcentajes = abcService.calcularPorcentajes(result.stats);
    abcView.renderStats(result.stats, porcentajes);
  } catch (err) {
    logger.error({ err }, "Error cargando reporte ABC");
  }
}

function conectarBoton() {
  const btn = document.getElementById("btnRecalcularABC");
  if (!btn || btn.dataset.listener) return;
  btn.dataset.listener = "true";

  btn.addEventListener("click", async () => {
    abcView.setBtnEstado(btn, true);
    try {
      await abcService.recalcular();
      alert("✅ ABC actualizado correctamente");
      await cargarDatos();
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      abcView.setBtnEstado(btn, false);
    }
  });
}