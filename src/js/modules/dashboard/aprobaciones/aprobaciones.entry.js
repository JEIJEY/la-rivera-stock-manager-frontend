import logger from "../../../core/logger.js";
import { solicitudesMovimientoApi } from "../shared/solicitudesMovimiento.api.js";
import { aprobacionesView } from "./aprobaciones.view.js";

const POLL_INTERVAL_MS = 30_000;
let pollTimer = null;

/** Toast no bloqueante reutilizable */
function toast(msg, tipo = "ok", duracion = 3500) {
  const id = "bc-toast-global";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.style.cssText = [
      "position:fixed", "top:16px", "left:50%", "transform:translateX(-50%)",
      "padding:14px 22px", "border-radius:10px", "font-size:15px", "font-weight:600",
      "box-shadow:0 8px 24px rgba(0,0,0,0.25)", "z-index:2147483647",
      "transition:opacity 0.25s", "pointer-events:none",
      "max-width:90vw", "text-align:center",
    ].join(";");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = tipo === "ok" ? "#16a34a" : tipo === "warn" ? "#d97706" : "#dc2626";
  el.style.color = "#fff";
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; }, duracion);
}

export async function inicializarAprobaciones() {
  logger.info("Inicializando vista de aprobaciones...");

  const lista = document.getElementById("aprobacionesLista");
  const estadoEl = document.getElementById("estadoAprobaciones");
  const btnRecargar = document.getElementById("btnRecargarAprobaciones");

  if (!lista) {
    logger.warn("Vista aprobaciones: contenedor no encontrado");
    return;
  }

  async function cargar() {
    aprobacionesView.renderEstado(estadoEl, "⏳ Cargando solicitudes pendientes...");
    try {
      const pendientes = await solicitudesMovimientoApi.getPendientes();
      aprobacionesView.renderKPIs(pendientes);
      aprobacionesView.renderCards(pendientes, lista, estadoEl);

      // Notificar al badge del sidebar para que se actualice al instante
      const badge = document.getElementById("badgeAprobaciones");
      if (badge) {
        const n = pendientes.length;
        if (n > 0) { badge.textContent = String(n); badge.hidden = false; }
        else badge.hidden = true;
      }
    } catch (err) {
      logger.error({ err }, "Error cargando aprobaciones");
      aprobacionesView.renderEstado(estadoEl, "💥 Error al cargar las solicitudes");
    }
  }

  // ── Click delegado en aprobar/rechazar ──────────────────────────────
  lista.addEventListener("click", async (e) => {
    const btnAprobar = e.target.closest(".aprob-card__btn-aprobar");
    const btnRechazar = e.target.closest(".aprob-card__btn-rechazar");

    if (btnAprobar) {
      const id = btnAprobar.dataset.id;
      btnAprobar.disabled = true;
      try {
        const resp = await solicitudesMovimientoApi.aprobar(id);
        toast(`✅ Solicitud aprobada · Stock: ${resp.stock_anterior} → ${resp.stock_nuevo}`);
        await cargar();
      } catch (err) {
        toast(`❌ ${err.message || "No se pudo aprobar la solicitud"}`, "error");
        btnAprobar.disabled = false;
      }
      return;
    }

    if (btnRechazar) {
      const id = btnRechazar.dataset.id;
      const motivo = prompt("Motivo del rechazo (mínimo 5 caracteres):");
      if (motivo === null) return;
      if (motivo.trim().length < 5) {
        toast("El motivo debe tener al menos 5 caracteres", "warn");
        return;
      }
      btnRechazar.disabled = true;
      try {
        await solicitudesMovimientoApi.rechazar(id, motivo.trim());
        toast(`❌ Solicitud rechazada`);
        await cargar();
      } catch (err) {
        toast(`❌ ${err.message || "No se pudo rechazar la solicitud"}`, "error");
        btnRechazar.disabled = false;
      }
    }
  });

  if (btnRecargar && !btnRecargar.dataset.listener) {
    btnRecargar.dataset.listener = "true";
    btnRecargar.addEventListener("click", cargar);
  }

  await cargar();

  // Polling: refresco cada 30s sin parpadear UI
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const pendientes = await solicitudesMovimientoApi.getPendientes();
      aprobacionesView.renderKPIs(pendientes);
      aprobacionesView.renderCards(pendientes, lista, estadoEl);
    } catch (_) { /* tolerar */ }
  }, POLL_INTERVAL_MS);

  // Detener polling al salir de la vista (no hay hook directo — usamos visibility)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  });
}
