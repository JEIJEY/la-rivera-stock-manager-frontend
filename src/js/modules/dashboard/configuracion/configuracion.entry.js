import logger from "../../../core/logger.js";
import { initThemeToggle, setTheme } from "../../../shared/theme.js";

export async function inicializarConfiguracion() {
  logger.info("Vista de configuración cargada");

  // Re-inicializa toggles: el del header + el nuevo de la vista de config
  initThemeToggle();

  // Botones de selección directa de tema (las tarjetas de preview)
  document.querySelectorAll("[data-theme-opt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(btn.dataset.themeOpt);
    });
  });
}
