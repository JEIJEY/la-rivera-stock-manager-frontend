// ============================================================
//  theme.js — La Rivera Stock Manager
//  Gestión de tema Dark / Light con localStorage
// ============================================================

const THEME_KEY   = "la-rivera-theme";
const DEFAULT     = "dark";
const HTML        = document.documentElement;

/** Devuelve el tema activo desde localStorage o el default */
export function getTheme() {
  return localStorage.getItem(THEME_KEY) || DEFAULT;
}

/**
 * Aplica un tema al <html> y persiste en localStorage.
 * Sincroniza todos los toggles presentes en el DOM.
 * @param {"dark"|"light"} theme
 */
export function setTheme(theme) {
  HTML.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  _syncToggles(theme);
  _updateThemeLabel(theme);
}

/** Invierte el tema actual */
export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

/**
 * Lee el localStorage y aplica el tema al cargar la página.
 * Llamar lo antes posible (antes del primer render).
 */
export function initTheme() {
  setTheme(getTheme());
}

/**
 * Adjunta el listener de cambio a todos los .neo-toggle-input presentes.
 * Seguro de llamar varias veces (clona el nodo para limpiar listeners viejos).
 */
export function initThemeToggle() {
  document.querySelectorAll(".neo-toggle-input").forEach((cb) => {
    // Elimina listeners anteriores clonando el nodo
    const fresh = cb.cloneNode(true);
    cb.replaceWith(fresh);

    fresh.addEventListener("change", () => {
      setTheme(fresh.checked ? "dark" : "light");
    });
  });

  // Sincroniza estado visual con el tema actual
  _syncToggles(getTheme());
  _updateThemeLabel(getTheme());
}

// ── Privado ──────────────────────────────────────────────────

function _syncToggles(theme) {
  document.querySelectorAll(".neo-toggle-input").forEach((cb) => {
    cb.checked = theme === "dark";
  });
}

function _updateThemeLabel(theme) {
  document.querySelectorAll("[data-theme-label]").forEach((el) => {
    el.textContent =
      theme === "dark" ? "Modo oscuro activo" : "Modo claro activo";
  });

  // Config view buttons: marcar el activo
  document.querySelectorAll("[data-theme-opt]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeOpt === theme);
  });
}
