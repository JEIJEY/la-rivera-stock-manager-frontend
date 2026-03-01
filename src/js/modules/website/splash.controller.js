import { navigate } from "../../core/router.js";

export function renderSplash() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="redirect">
      <div class="redirect__content">
        <h1 class="redirect__title">La Rivera</h1>
        <p class="redirect__message">Cargando sistema de inventarios...</p>
        <div class="redirect__spinner"></div>
        <div class="redirect__actions">
          <button class="btn btn--primary" id="btnEntrar">Entrar Ahora</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btnEntrar").addEventListener("click", () => {
    navigate("/landing");
  });

  setTimeout(() => {
    navigate("/landing");
  }, 3000);
}