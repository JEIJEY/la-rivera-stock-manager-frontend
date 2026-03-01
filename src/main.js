import "./styles/index.css";
import logger from "./js/core/logger.js";
import { registerRoute, initRouter } from "./js/core/router.js";

import { renderSplash } from "./js/modules/website/splash.controller.js";
import { renderLanding } from "./js/modules/website/landing.controller.js";
import { renderLogin } from "./js/modules/auth/login.js";
import { renderRegister } from "./js/modules/auth/register.js"; // ← AGREGAR
import { renderDashboard } from "./js/modules/dashboard/dashboard.entry.js";

logger.info("Frontend iniciado correctamente");

registerRoute("/", renderSplash);
registerRoute("/landing", renderLanding);
registerRoute("/login", renderLogin);
registerRoute("/register", renderRegister); // ← AGREGAR
registerRoute("/dashboard", renderDashboard);

initRouter();