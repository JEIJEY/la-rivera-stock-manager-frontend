import logger from "./logger.js";

const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  loadRoute(path);
}

export function initRouter() {
  window.addEventListener("popstate", () => {
    loadRoute(window.location.pathname);
  });

  loadRoute(window.location.pathname);
}

function loadRoute(path) {
  logger.info("Cargando ruta: " + path);
  const handler = routes.get(path);

  if (!handler) {
    logger.warn("Ruta no encontrada: " + path);
    return;
  }

  handler();
}