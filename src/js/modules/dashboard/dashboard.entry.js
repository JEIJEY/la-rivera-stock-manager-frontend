export async function renderDashboard() {
  const app = document.getElementById("app");

  const response = await fetch("/src/pages/dashboard-layout.html");
  const html = await response.text();

  app.innerHTML = html;

  // Import dinámico del SPA interno
  const module = await import("./dashboard.js");
}