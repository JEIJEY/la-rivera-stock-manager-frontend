export async function renderDashboard() {
  const app = document.getElementById("app");

  const response = await fetch("/pages/dashboard-layout.html");
  const html = await response.text();

  app.innerHTML = html;

  // Importa e inicializa el dashboard SPA DESPUÉS de renderizar el HTML.
  // `inicializarDashboard` tiene su propio guard contra doble ejecución.
  const { inicializarDashboard } = await import("./dashboard.js");
  await inicializarDashboard();
}