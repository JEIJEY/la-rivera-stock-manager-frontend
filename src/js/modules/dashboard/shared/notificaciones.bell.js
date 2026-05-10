/**
 * notificaciones.bell.js — Campana de notificaciones tipo header.
 *
 * Renderiza un botón con icono 🔔 + badge contador, abre dropdown con las
 * últimas notificaciones al click, hace polling cada 30s para refrescar el badge.
 *
 * Uso:
 *   import { montarCampana } from "../shared/notificaciones.bell.js";
 *   montarCampana(document.getElementById("campanaNotificaciones"));
 *
 * Idempotente: si el contenedor ya tiene la campana, no la duplica.
 */
import { notificacionesApi } from "./notificaciones.api.js";

const POLL_INTERVAL_MS = 30_000;
const LIMITE_VISTA = 20;

/** Tiempo relativo simple: "hace 5 min", "hace 2h", "hace 3 días" */
function tiempoRelativo(fechaISO) {
  const ahora = Date.now();
  const t = new Date(fechaISO).getTime();
  const diff = Math.max(0, ahora - t);
  const seg = Math.floor(diff / 1000);
  if (seg < 60) return "hace unos segundos";
  const min = Math.floor(seg / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}

function iconoPorTipo(tipo) {
  switch (tipo) {
    case "solicitud_pendiente":  return "📋";
    case "solicitud_resultado":  return "✅";
    case "stock_bajo":           return "⚠️";
    default:                     return "🔔";
  }
}

function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function montarCampana(contenedorEl) {
  if (!contenedorEl) return;
  if (contenedorEl.dataset.montada === "true") return;
  contenedorEl.dataset.montada = "true";

  // ── DOM ──────────────────────────────────────────────────────────────
  contenedorEl.innerHTML = `
    <button type="button" class="notif-campana" aria-label="Notificaciones" aria-expanded="false">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
           class="notif-campana__icono">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span class="notif-campana__badge" hidden>0</span>
    </button>
    <div class="notif-dropdown" hidden>
      <div class="notif-dropdown__cabecera">
        <span class="notif-dropdown__titulo">Notificaciones</span>
        <button type="button" class="notif-dropdown__leer-todas">Marcar todas como leídas</button>
      </div>
      <ul class="notif-dropdown__lista">
        <li class="notif-dropdown__vacio">Sin notificaciones</li>
      </ul>
    </div>
  `;

  const btn = contenedorEl.querySelector(".notif-campana");
  const badge = contenedorEl.querySelector(".notif-campana__badge");
  const dropdown = contenedorEl.querySelector(".notif-dropdown");
  const lista = contenedorEl.querySelector(".notif-dropdown__lista");
  const btnLeerTodas = contenedorEl.querySelector(".notif-dropdown__leer-todas");

  // ── Estado ───────────────────────────────────────────────────────────
  let pollTimer = null;
  let dropdownAbierto = false;

  // ── Helpers de actualización ─────────────────────────────────────────
  async function actualizarBadge() {
    try {
      const { conteo } = await notificacionesApi.conteo();
      if (conteo > 0) {
        badge.textContent = conteo > 99 ? "99+" : String(conteo);
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (_) {
      // sin token o backend caído — ignorar silenciosamente
    }
  }

  function renderItems(items) {
    if (!items || items.length === 0) {
      lista.innerHTML = `<li class="notif-dropdown__vacio">Sin notificaciones</li>`;
      return;
    }
    lista.innerHTML = items
      .slice(0, LIMITE_VISTA)
      .map(
        (n) => `
        <li class="notif-item ${n.leida ? "" : "notif-item--no-leida"}"
            data-id="${n.id_notificacion}"
            data-enlace="${escapeHtml(n.enlace || "")}">
          <span class="notif-item__icono">${iconoPorTipo(n.tipo)}</span>
          <div class="notif-item__cuerpo">
            <div class="notif-item__titulo">${escapeHtml(n.titulo)}</div>
            <div class="notif-item__mensaje">${escapeHtml(n.mensaje)}</div>
            <div class="notif-item__tiempo">${tiempoRelativo(n.fecha_creacion)}</div>
          </div>
        </li>`
      )
      .join("");
  }

  async function cargarLista() {
    try {
      const items = await notificacionesApi.listar(false);
      renderItems(items);
    } catch (_) {
      lista.innerHTML = `<li class="notif-dropdown__vacio">No se pudieron cargar las notificaciones</li>`;
    }
  }

  async function manejarClickItem(li) {
    const id = li.dataset.id;
    const enlace = li.dataset.enlace;
    try {
      await notificacionesApi.marcarLeida(id);
    } catch (_) { /* tolerar fallo */ }
    cerrarDropdown();
    if (enlace?.startsWith("#")) {
      window.location.hash = enlace.replace(/^#/, "");
    }
    await actualizarBadge();
  }

  // ── Mecanismo de cierre: overlay + listener fresco por apertura ──────
  let overlay = null;

  function onOverlayClick(e) {
    e.stopPropagation();
    cerrarDropdown();
  }
  function onDocKeydown(e) {
    if (e.key === "Escape") cerrarDropdown();
  }

  function abrirDropdown() {
    if (dropdownAbierto) return;
    dropdownAbierto = true;
    dropdown.hidden = false;
    btn.setAttribute("aria-expanded", "true");

    // Crear overlay full-screen transparente. Captura cualquier click
    // fuera del dropdown (el dropdown tiene z-index 1000 en CSS, overlay 999).
    overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999;background:transparent;pointer-events:auto";
    overlay.addEventListener("mousedown", onOverlayClick);
    overlay.addEventListener("touchstart", onOverlayClick, { passive: true });
    document.body.appendChild(overlay);

    document.addEventListener("keydown", onDocKeydown);

    cargarLista();
  }

  function cerrarDropdown() {
    if (!dropdownAbierto) return;
    dropdownAbierto = false;
    dropdown.hidden = true;
    btn.setAttribute("aria-expanded", "false");

    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.removeEventListener("keydown", onDocKeydown);
  }

  // ── Listeners persistentes ───────────────────────────────────────────
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdownAbierto) cerrarDropdown();
    else abrirDropdown();
  });

  // Click delegado en los items
  lista.addEventListener("click", (e) => {
    const li = e.target.closest(".notif-item");
    if (li) manejarClickItem(li);
  });

  // Marcar todas como leídas
  btnLeerTodas.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      await notificacionesApi.marcarTodasLeidas();
      await cargarLista();
      await actualizarBadge();
    } catch (_) { /* tolerar fallo */ }
  });

  // ── Polling ──────────────────────────────────────────────────────────
  function iniciarPolling() {
    if (pollTimer) return;
    actualizarBadge();
    pollTimer = setInterval(actualizarBadge, POLL_INTERVAL_MS);
  }

  // Detener polling si la pestaña se oculta (ahorra peticiones)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    } else {
      iniciarPolling();
    }
  });

  iniciarPolling();
}
