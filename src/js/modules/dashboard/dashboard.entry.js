export async function renderDashboard() {
  const app = document.getElementById("app");

  const response = await fetch("/pages/dashboard-layout.html");
  const html = await response.text();

  // Limpiar overlay residual de la campana si quedó de una sesión anterior
  document.querySelectorAll("#notif-overlay, [data-notif-overlay]").forEach((el) => el.remove());

  app.innerHTML = html;

  // Importa e inicializa el dashboard SPA DESPUÉS de renderizar el HTML.
  // `inicializarDashboard` tiene su propio guard contra doble ejecución.
  const { inicializarDashboard } = await import("./dashboard.js");
  await inicializarDashboard();
}